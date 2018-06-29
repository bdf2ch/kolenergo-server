import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { Middleware, NestMiddleware } from '@nestjs/common';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';
import { AhoRequestsService } from '../aho-requests.service';

@Middleware()
export class ExportRequestsMiddleware implements NestMiddleware {
    constructor(private readonly ahoRequestService: AhoRequestsService) {}

    async resolve(...args: any[]): AsyncExpressMiddleware {
        return async (req, res: Response, next) => {
            const start = req.query.start;
            const end = req.query.end;
            const employeeId = req.query.employeeId;
            const requestTypeId = req.query.requestTypeId;
            const requestStatusId = req.query.requestStatusId;
            const url = await this.ahoRequestService.exportRequests(start, end, employeeId, requestTypeId, requestStatusId);
            fs.copyFile(url, path.resolve('./static/aho.xlsx'), (error) => {
                if (error) {
                    console.log(error);
                }
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.json('static/aho.xlsx');
            });

        };
    }
}