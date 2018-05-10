import { Middleware, NestMiddleware, ExpressMiddleware, Res, Req } from '@nestjs/common';
import * as passport from 'passport';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';

@Middleware()
export class LogInMiddleware implements NestMiddleware {
    async resolve(): AsyncExpressMiddleware {
        return async (req, res, next) => {
            await passport.authenticate('local', (error, user) => {
                if (error) {
                    return next(error);
                }
                req.logIn(user, (err) => {
                    if (err) {
                        return next(err);
                    }
                });
            })(req, res, next);
            next();
        };
    }
}