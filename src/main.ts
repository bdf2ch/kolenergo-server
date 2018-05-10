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
      bodyParser.json(),
      cookieParser(),
      session({
          secret: '$42Do2&4hir4&4hir4ret',
          saveUninitialized: true,
          resave: true,
          cookie: {
              maxAge: 10 * 365 * 24 * 3600000,
          },
      }),
      passport.initialize(),
      passport.session(),
  );
  await app.listen(3000);
}
bootstrap();
