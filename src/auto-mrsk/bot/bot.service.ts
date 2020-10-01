import { Component, Logger } from '@nestjs/common';

import { Extra, Markup, Telegraf, BaseScene, Stage, session } from 'telegraf';
import * as moment from 'moment';

import { IUser, IApplicationRole, IServerResponse } from '@kolenergo/core';
import { IRequest, IRoutePoint } from '@kolenergo/auto';
import { RequestsService } from '../requests/requests.service';
import { LDAPService } from '../../common/authentication/ldap.service';
import { PostgresService } from '../../common/database/postgres.service';
import { UsersService } from '../../common/users/users.service';
import { ILdapUser } from '../../common/authentication/interfaces/ldap-user.interface';
import { ISession, ITelegramUser } from './interfaces';
import { environment } from '../../envoirenments';

@Component()
export class BotService {
  private readonly bot;
  private readonly authScene: BaseScene<any>;
  private readonly userScene: BaseScene<any>;
  private readonly driverScene: BaseScene<any>;

  constructor(
    private readonly ldap: LDAPService,
    private postgre: PostgresService,
    private readonly users: UsersService,
    private readonly requests: RequestsService,
  ) {
    this.bot = new Telegraf(environment.telegramBotToken);
    this.authScene = new BaseScene('auth-scene');
    this.userScene = new BaseScene('user-scene');
    this.driverScene = new BaseScene('driver-scene');

    this.bot.session = null;
    this.bot.context.account = null;
    this.bot.context.password = null;
    this.bot.context.user = null;
    this.bot.context.requests = {data: []};
    this.initAuthScene();
    this.initUserScene();
    this.initDriverScene();
    const stage = new Stage([this.authScene, this.userScene, this.driverScene]);
    this.bot.use(session());
    this.bot.use(stage.middleware());
    this.bot.start(async (ctx) => {
      const session: IServerResponse<{session: ISession, user: IUser}> = await this.getSession((ctx.from as ITelegramUser).id);
      Logger.log(JSON.stringify(session));
      if (session.data.session) {
        this.bot.context.session = session.data.session;
        this.bot.context.user = session.data.user;
        const isDriver = (this.bot.context.user as IUser).rolesList.find((role: IApplicationRole) => role.id === 21);
        if (isDriver) {
          await ctx.scene.enter('driver-scene');
        } else {
          await ctx.scene.enter('user-scene');
        }
      } else {
        await ctx.scene.enter('auth-scene');
      }
    });
    this.bot.launch();
  }

  /**
   * Инициализация сцены авторизации
   */
  initAuthScene() {
    /**
     * Обработчик входа в сцену
     */
    this.authScene.enter(async (ctx) => {
      this.bot.context.account = null;
      this.bot.context.password = null;
      this.bot.context.user = null;
      this.bot.context.currentRequestIndex = 0;
      await ctx.reply(
        'Для начала работы с ботом необходимо авторизоваться',
        Extra.markup(
          Markup.inlineKeyboard([
            Markup.callbackButton('Авторизация', 'auth'),
          ]),
        ),
      );
    });

    /**
     * Обработчик нажатия на кнопку авторизации
     */
    this.authScene.action('auth', async (ctx) => {
      await ctx.reply('Введите Вашу учетную запись Active Directory');
    });

    /**
     * Обработчик полученного текстового сообщения
     */
    this.authScene.on('text', async (ctx) => {
      if (!this.bot.context.account) {
        this.bot.context.account = ctx.message.text;
        await ctx.reply('Введите пароль');
      } else {
        this.bot.context.password = ctx.message.text;
        try {
          const ldapUser: ILdapUser = await this.ldap.logIn(this.bot.context.account, this.bot.context.password);
          if (ldapUser) {
            this.bot.context.user = await this.users.getByAccount(ldapUser.sAMAccountName, 'AUTO_REQUESTS_MRSK');
            await this.addSession(this.bot.context.user.id, (ctx.from as ITelegramUser).id);
            const isDriver = (this.bot.context.user as IUser).rolesList.find((role: IApplicationRole) => role.id === 21);
            if (isDriver) {
              await ctx.scene.enter('driver-scene');
            } else {
              await ctx.scene.enter('user-scene');
            }
          }
        } catch (err) {
          Logger.error(err.message);
          await ctx.reply('Пользователь не найден');
          return ctx.scene.reenter();
        }
      }
    });

    /**
     * Обработчик выхода со сцены
     */
    this.authScene.leave(async () => {});

  }

  /**
   * Инициализация сцены пользователя
   */
  initUserScene() {
    /**
     * Обработчик входа в сцену
     */
    this.userScene.enter(async (ctx) => {
      this.bot.context.currentRequestIndex = 0;
      this.bot.context.requests = await this.requests.getRequests(
        0,
        0,
        0,
        4,
        0,
        0,
        this.bot.context.user.id,
        null,
      );
      await ctx.reply(
        `Здравствуйте, ${this.bot.context.user.firstName}!`,
        Markup.keyboard([[`🚗 Мои заявки (${this.bot.context.requests.data.length})`]]).oneTime().resize().extra(),
      );
    });

    this.userScene.action('next', async (ctx) => {
      this.bot.context.currentRequestIndex = this.bot.context.currentRequestIndex + 1 <= this.bot.context.requests.data.length - 1
        ? this.bot.context.currentRequestIndex + 1
        : 0;
      const request = this.bot.context.requests.data[this.bot.context.currentRequestIndex];
      let routes = '';
      (request as IRequest).route.forEach((route: IRoutePoint) => {
        routes += `▫ ${route.title}\n`;
      });
      await ctx.replyWithHTML(
        `<b>Заявка #${request.id}</b>\n
🕒 <strong>${moment(request.startTime).format('DD.MM.YYYY, HH:mm')} - ${moment(request.endTime).format('HH:mm')}</strong>
ℹ <i>${request.description}</i>\n
${routes}
🚘 ${request.transport ? request.transport.model + ' - ' + request.transport.registrationNumber : 'Не назначен'}
👨 ${request.driver ? request.driver.firstName + ' ' + request.driver.lastName + (request.driver.phone ? ' - ' + request.driver.phone : '') : 'Не назначен'}
`,
        Extra.markup(
          Markup.inlineKeyboard(
            this.bot.context.requests.data.length > 1
              ? [
                  Markup.callbackButton('Отменить заявку', 'cancel'),
                  Markup.callbackButton('Следующая заявка', 'next'),
                ]
              : [
                  Markup.callbackButton('Отменить заявку', 'cancel'),
                ]),
        ));
    });

    this.userScene.action('cancel', async (ctx) => {
      const request = this.bot.context.requests.data[this.bot.context.currentRequestIndex];
      await this.requests.cancelRequest(request.id);
      this.bot.context.requests.data.splice(this.bot.context.currentRequestIndex, 1);
      return await ctx.reply(`Заявка #${request.id} отменена`);
    });

    this.userScene.hears(/🚗 Мои заявки*/, async (ctx) => {
      this.bot.context.requests = await this.requests.getRequests(
        0,
        0,
        0,
        4,
        0,
        0,
        this.bot.context.user.id,
        null,
      );
      const request = this.bot.context.requests.data[this.bot.context.currentRequestIndex];
      let routes = '';
      (request as IRequest).route.forEach((route: IRoutePoint) => {
        routes += `▫ ${route.title}\n`;
      });
      await ctx.replyWithHTML(
        `<b>Заявка #${request.id}</b>\n
🕒 <strong>${moment(request.startTime).format('DD.MM.YYYY, HH:mm')} - ${moment(request.endTime).format('HH:mm')}</strong>
ℹ <i>${request.description}</i>\n
${routes}
🚘 ${request.transport ? request.transport.model + ' - ' + request.transport.registrationNumber : 'Не назначен'}
👨 ${request.driver ? request.driver.firstName + ' ' + request.driver.lastName + ' - ' + request.driver.phone : 'Не назначен'}
`,
        Extra.markup(
          Markup.inlineKeyboard(
            this.bot.context.requests.data.length > 1
              ? [
                Markup.callbackButton('Отменить заявку', 'cancel'),
                Markup.callbackButton('Следующая заявка', 'next'),
              ]
              : [
                Markup.callbackButton('Отменить заявку', 'cancel'),
              ]),
        ));
    });
  }

  /**
   * Инициализация сцены водителя
   */
  initDriverScene() {
    /**
     * Обработчик входа в сцену
     */
    this.driverScene.enter(async (ctx) => {
      this.bot.context.account = null;
      this.bot.context.password = null;
      this.bot.context.user = null;
      await ctx.reply(
        `Здравствуйте, ${this.bot.context.user.firstName}!`,
        Markup.keyboard([[`🚗 Мои поездки (${this.bot.context.requests.length})`]]).oneTime().resize().extra(),
      );
    });
  }

  /**
   * Получение сессии пользователя
   * @param telegramId - Идентификатор пользователя Telegram
   */
  async getSession(telegramId: number): Promise<IServerResponse<{session: ISession, user: IUser}>> {
    return await this.postgre.query(
      'auto-mrsk-get-telegram-session',
      'SELECT auto_mrsk.sessions_get($1)',
      [telegramId],
      'sessions_get',
    );
  }

  /**
   * Добавление сессии пользователя
   * @param userId - Идентификатор пользователя
   * @param telegramId - Идентификатор пользователя Telegram
   */
  async addSession(userId: number, telegramId: number): Promise<IServerResponse<{id: number, userId: number, telegramId: number}>> {
    return await this.postgre.query(
      'auto-mrsk-add-telegram-session',
      'SELECT auto_mrsk.sessions_add($1, $2)',
      [userId, telegramId],
      'sessions_add',
    );
  }
}
