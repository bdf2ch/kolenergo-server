import { Component, OnModuleInit } from '@nestjs/common';

import { Extra, Markup, Telegraf, BaseScene, Stage, session } from 'telegraf';

import { RequestsService } from '../requests/requests.service';
import { environment } from '.././../envoirenments';
import {TelegrafContext} from 'telegraf/typings/context';
import { IAuth } from './interfaces';
import { AuthenticationService } from '../../common/authentication/authentication.service';
import {LDAPService} from '../../common/authentication/ldap.service';
import { authScene } from './scenes';

@Component()
export class BotService {
  private bot;
  private authScene: BaseScene<any>;
  private authData: IAuth = {
    account: null,
    password: null,
  };

  constructor(private readonly ldap: LDAPService) {
    this.bot = new Telegraf(environment.telegramBotToken);
    this.bot.context.account = '';
    this.bot.context.password = '';
    this.bot.context.user = null;

    // this.bot.start((ctx) => ctx.scene.enter('auth'));
    /*
    this.bot.action('auth', async (ctx: TelegrafContext) => {
      await ctx.reply('Auth Command reply');
    });
     */
    /*
    this.bot.command('/custom', ({ reply }) => {
      return reply('Custom buttons keyboard', Markup
        .keyboard([
          ['🔍 Search', '😎 Popular'], // Row1 with 2 buttons
          ['☸ Setting', '📞 Feedback'], // Row2 with 2 buttons
          ['📢 Ads', '⭐️ Rate us', '👥 Share'] // Row3 with 3 buttons
        ])
        .oneTime()
        .resize()
        .extra(),
      );
    });

     */

    /*
    this.authScene = new BaseScene<any>('auth-scene');
    this.authScene.enter(async (ctx) => {
      await ctx.reply(
        'Для начала работы необходимо авторизоваться',
        Extra.markup(
          Markup.inlineKeyboard([
            Markup.callbackButton('Авторизация', 'auth'),
          ]),
        ),
      );
    });
    this.authScene.leave(async (ctx: TelegrafContext) => {});
    this.authScene.action('auth', async (ctx: TelegrafContext) => {
      await ctx.reply('Введите Вашу учетную запись Active Directory');
    });
    this.authScene.on('text', async (ctx) => {
      if (!this.authData.account) {
        this.authData.account = ctx.message.text;
        await ctx.reply('Введите пароль');
      } else {
        this.authData.password = ctx.message.text;
        this.authScene.leave();
        let user;
        try {
          user = await this.ldap.logIn(this.authData.account, this.authData.password);
        } catch (err) {
          console.log(err);
          this.authData = {
            account: null,
            password: null,
          };
          await ctx.reply('Пользователь не найден');
        }

        if (user) {
          await ctx.reply(`Здравствуйте, ${user.name}!`, Markup
            .keyboard([['🚗 Мои заявки']])
            .oneTime()
            .resize()
            .extra(),
          );
        }

        await ctx.scene.leave();
      }
      console.log(this.authData);
    });
     */

    const stage = new Stage([authScene]);
    this.bot.use(session());
    this.bot.use(stage.middleware());
    this.bot.start(async (ctx) => {
      await ctx.scene.enter('auth-scene');
    });
    this.bot.launch();
  }
}
