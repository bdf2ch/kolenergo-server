import {BaseScene, Extra, Markup, session} from 'telegraf';

export const authScene = new BaseScene('auth-scene');

authScene.enter(async (ctx) => {
  console.log(ctx);
  await ctx.reply(
    'Для начала работы необходимо авторизоваться',
    Extra.markup(
      Markup.inlineKeyboard([
        Markup.callbackButton('Авторизация', 'auth'),
      ]),
    ),
  );
});

authScene.action('auth', async (ctx) => {
  await ctx.reply('Введите Вашу учетную запись Active Directory');
});

authScene.on('text', async (ctx) => {
  if (ctx.account === '') {
    ctx.account = ctx.message.text;
    console.log('account', ctx.account);
    await ctx.reply('Введите пароль');
  } else {
    ctx.password = ctx.message.text;
    try {
      ctx.user = await this.ldap.logIn(ctx.account, ctx.password);
    } catch (err) {
      console.log(err);
      ctx.account = null;
      ctx.password = null;
      await ctx.reply('Пользователь не найден');
    }
    if (ctx.user) {
      await ctx.reply(`Здравствуйте, ${ctx.user.name}!`, Markup
        .keyboard([['🚗 Мои заявки']])
        .oneTime()
        .resize()
        .extra(),
      );
    }
    await ctx.scene.leave();
  }
  console.log(ctx.account, ctx.password);
});

authScene.leave(async (ctx: TelegrafContext) => {});
