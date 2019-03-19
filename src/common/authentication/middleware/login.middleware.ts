import {
  Middleware,
  NestMiddleware,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces'
import * as passport from 'passport';


@Middleware()
export class LogInMiddleware implements NestMiddleware {
  async resolve(): AsyncExpressMiddleware {
    return async (req, res, next) => {
      await passport.authenticate('local', (error, user) => {
        if (error) {
          console.log('error', error);
          let exception;
          switch (error) {
            case 'Access denied':
              exception = new ForbiddenException('Access denied');
              break;
            case 'User not found':
              exception = new UnauthorizedException('User not found');
              break;
            default:
              exception = new InternalServerErrorException();
              break;
          }
          next(exception);
        }

        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          res.json(user);
        });
        next();
      })(req, res, next);
    };
  }
}
