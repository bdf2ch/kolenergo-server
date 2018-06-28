import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { Middleware, NestMiddleware } from '@nestjs/common';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';
import { AhoRequestsService } from '../aho-requests.service';

@Middleware()
export class ExportNeedsMiddleware implements NestMiddleware {
    constructor(private readonly ahoRequestService: AhoRequestsService) {}

    async resolve(...args: any[]): AsyncExpressMiddleware {
        return async (req, res: Response, next) => {
            const url = await this.ahoRequestService.exportNeeds();
            console.log(url);
            fs.copyFile(url, path.resolve('./static/export.xlsx'), (error) => {
                console.log('file copied');
            });
            //res.setHeader('Content-Description', 'File Transfer');
            //res.setHeader('Cache-Control', 'max-age=0');
            //res.setHeader('Content-Transfer-Encoding', 'binary');
            //res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            //res.download(url, 'export.xlsx');
            next();
        };
    }
}