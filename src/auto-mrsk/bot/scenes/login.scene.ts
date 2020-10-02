import { Composer, Extra, Markup } from 'telegraf';
import { WizardScene } from 'telegraf/scenes/wizard';

const loginHandler = new Composer();
loginHandler.action('login', (ctx) => {
  return ctx.wizard.next();
});

export const loginWizard = new WizardScene('login-wizard',

  // Приглашение к авторизации
  async (ctx) => {
    await ctx.reply(
      'Для начала работы с ботом необходимо авторизоваться',
      Extra.markup(
        Markup.inlineKeyboard([
          Markup.callbackButton('Авторизация', 'login'),
        ]),
      ),
    );
    return ctx.wizard.next();
  },

  // Обработчик нажатия кнопки авторизации
  loginHandler,

  (ctx) => {

    //Validate the name
    if (ctx.message.text.length < 1 || ctx.message.text.length > 12) {
      return ctx.reply("Name entered has an invalid length!");
    }

    //Store the entered name
    ctx.scene.session.user.name = ctx.message.text;
    ctx.reply("What is your last name?");
    return ctx.wizard.next();
  },
  async (ctx) => {

    //Validate last name
    if (ctx.message.text.length > 30) {
      return ctx.reply("Last name has an invalid length");
    }

    ctx.scene.session.user.lastName = ctx.message.text;

    //Store the user in a separate controller
    // userController.StoreUser(ctx.scene.session.user);
    return ctx.scene.leave(); //<- Leaving a scene will clear the session automatically
  }
);
