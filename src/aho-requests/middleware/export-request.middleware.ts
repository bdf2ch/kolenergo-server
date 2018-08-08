import { Response } from 'express';
import { Middleware, NestMiddleware } from '@nestjs/common';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';
import { AhoRequestsService } from '../aho-requests.service';

@Middleware()
export class ExportRequestMiddleware implements NestMiddleware {
    constructor(private readonly ahoRequestService: AhoRequestsService) {}

    async resolve(...args: any[]): AsyncExpressMiddleware {
        return async (req, res: Response, next) => {
            const requestId = req.params.id;
            const url = await this.ahoRequestService.exportRequest(requestId);
            res.download(url);
        };
    }
}