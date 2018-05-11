import {Middleware, NestMiddleware, ExpressMiddleware, Res, Req, UnauthorizedException} from '@nestjs/common';
import * as passport from 'passport';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';

@Middleware()
export class LogInMiddleware implements NestMiddleware {
    async resolve(): AsyncExpressMiddleware {
        return async (req, res, next) => {
            await passport.authenticate('local', (error, user) => {
                if (error) {
                    //throw new UnauthorizedException(error);
                    return next(error);
                }
                req.logIn(user, (err) => {
                    if (err) {
                        return next(err);
                    }
                });
            })(req, res, next);

            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            res.header('Access-Control-Allow-Credentials', true);
            next();
        };
    }
}