import { Middleware, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import * as passport from 'passport';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';

@Middleware()
export class LogInMiddleware implements NestMiddleware {
    async resolve(): AsyncExpressMiddleware {
        return async (req, res, next) => {
            await passport.authenticate('local', (error, user) => {

              if (error) {
                  //res.status(HttpStatus.UNAUTHORIZED).json(null);
                //throw new UnauthorizedException();
                  console.log('auth failed');
                  console.log(req.body);
              }
              req.logIn(user, (err) => {
                  if (err) { return next(err); }
                  res.json(user);
              });
            })(req, res, next);
        };
    }
}