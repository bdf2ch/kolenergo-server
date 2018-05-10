import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
      cors({
          origin: true,
          credentials: true,
      }),
      cookieParser(),
      bodyParser.json(),
      session({
          secret: 'c0ck5uck3r',
          saveUninitialized: true,
          resave: true,
          cookie: {
              maxAge: 3600 * 24 * 30 * 356,
          },
      }),
      passport.initialize(),
      passport.session(),
  );
  await app.listen(3000);
}
bootstrap();
