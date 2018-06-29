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
            fs.copyFile(url, path.resolve('./static/needs.xlsx'), (error) => {
                if (error) {
                    console.log(error);
                }
                res.json('static/needs.xlsx');
            });

        };
    }
}