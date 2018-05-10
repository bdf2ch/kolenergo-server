import { Middleware, NestMiddleware, ExpressMiddleware, Res, Req } from '@nestjs/common';
import * as passport from 'passport';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';

@Middleware()
export class LogInMiddleware implements NestMiddleware {
    async resolve(): AsyncExpressMiddleware {
        return async (req, res, next) => {
            const authenticateCallback = (error, user) => {
                if (!user || error) {
                    //res.send({ message: 'Password or Email Address is invalid' });
                    //return;
                }

                req.logIn(user, (err) => {
                    if (err) {
                        //res.send(err);
                        //return;
                    }
                    //res.send(user);
                });
            };

            await passport.authenticate('local', authenticateCallback)(req, res, next);
            next();
        };
    }
}