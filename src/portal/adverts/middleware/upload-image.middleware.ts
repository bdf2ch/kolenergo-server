import { Response } from 'express';
import { Middleware, NestMiddleware } from '@nestjs/common';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';
import { AdvertsService } from '../adverts.service';
import * as multiparty from 'multiparty';

@Middleware()
export class UploadImageMiddleware implements NestMiddleware {
    constructor(private readonly advertsService: AdvertsService) {}

    async resolve(...args: any[]): AsyncExpressMiddleware {
        return async (req, res: Response, next) => {
            console.log(req);
            console.log('advert image upload middleware');
            const form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                Object.keys(fields).forEach((name) => {
                    console.log('got field named ' + name);
                });
            });
            // const url = await this.advertsService.uploadImage(req.body);
            // res.download(url);
        };
    }
}
