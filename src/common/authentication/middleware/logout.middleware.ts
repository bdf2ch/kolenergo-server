import { ExpressMiddleware, Middleware, NestMiddleware } from '@nestjs/common';

@Middleware()
export class LogOutMiddleware implements NestMiddleware {
    resolve(...args: any[]): ExpressMiddleware {
        return async (req, res, next) => {
            if (req.isAuthenticated()) {
                req.logOut();
            }
            next();
        };
    }
}