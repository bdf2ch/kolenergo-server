import { Response } from 'express';
import { Middleware, NestMiddleware } from '@nestjs/common';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';
import { AhoRequestsService } from '../aho-requests__.service';

@Middleware()
export class ExportRequestsMiddleware implements NestMiddleware {
    constructor(private readonly ahoRequestService: AhoRequestsService) {}

    async resolve(...args: any[]): AsyncExpressMiddleware {
        return async (req, res: Response, next) => {
            const start = req.query.start;
            const end = req.query.end;
            const userId = req.query.userId;
            const employeeId = req.query.employeeId;
            const requestTypeId = req.query.requestTypeId;
            const requestStatusId = req.query.requestStatusId;
            const url = await this.ahoRequestService.exportRequests(start, end, userId, employeeId, requestTypeId, requestStatusId);
            res.download(url);
        };
    }
}
