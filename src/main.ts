import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import * as compression from 'compression';
import { static } from 'express';

process
    .on('uncaughtException', (err) => {
        console.error(err.stack);
        console.log('Node NOT Exiting...');
    })
    .on('ECONNRESET', (err) => {
        console.error(err.stack);
        console.log('Node NOT Exiting...');
    })
    .on('ETIMEDOUT', (err) => {
        console.error(err.stack);
        console.log('Node NOT Exiting...');
    });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
      compression({level: 9, filter: shouldCompress}),
      cors({ origin: ['http://10.50.0.1053:3000', 'http://10.50.0.20', 'http://mrsksevzap.ru', /\.mrsksevzap\.ru$/], credentials: true }),
      cookieParser(),
      bodyParser.json(),
      session({
          secret: 'c0ck5uck3r',
          saveUninitialized: true,
          resave: true,
          cookie: {
              maxAge: 3600 * 24 * 30 * 356,
              sameSite: 'lax',
              secure: false,
          },
      }),
      passport.initialize(),
      passport.session(),
      static('./static'),
  );
  await app.listen(3000);
}
bootstrap();

function shouldCompress(req, res) {
  return true;
}
