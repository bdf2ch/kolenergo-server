import {ExpressMiddleware, Middleware, NestMiddleware} from '@nestjs/common';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';
import { Response, Request, NextFunction } from 'express';

@Middleware()
export class LogOutMiddleware implements NestMiddleware {
    resolve(...args: any[]): ExpressMiddleware {
        return async (req, res, next) => {
            if (req.isAuthenticated()) {
                req.logOut();
                //res.send('authenticated');
                //res.sendStatus(401);
                //return;
            }
            next();
        };
    }
}