import { Middleware, NestMiddleware, ExpressMiddleware, Res, Req } from '@nestjs/common';
import * as passport from 'passport';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';

@Middleware()
export class CheckMiddleware implements NestMiddleware {
  resolve(): ExpressMiddleware {
    return async (req, res, next) => {
      if (!req.isAuthenticated()) {
        //res.send(null);
      }
      next();
    };
  }
}