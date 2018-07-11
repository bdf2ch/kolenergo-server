import { Middleware, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';

@Middleware()
export class CheckMiddleware implements NestMiddleware {
  async resolve(...args: any[]): AsyncExpressMiddleware {
    return async (req, res, next) => {
      if (req.isAuthenticated()) {
        res.json(req.user);
      } else {
        // res.send(null);
        throw new UnauthorizedException('User not authorized');
      }
      next();
    };
  }
}