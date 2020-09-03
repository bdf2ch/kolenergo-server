import { Middleware, NestMiddleware } from '@nestjs/common';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';

import * as fs from 'fs';
import { Response } from 'express';

import { RequestsService } from '../requests/requests.service';

@Middleware()
export class ExportRequestsMiddleware implements NestMiddleware {
  constructor(private readonly requests: RequestsService) {}

  async resolve(...args: any[]): AsyncExpressMiddleware {
    return async (req, res: Response, next) => {
      const periodStart = parseInt(req.query.periodStart, null);
      const periodEnd = parseInt(req.query.periodEnd, null);
      const statusId = parseInt(req.query.statusId, null);
      const transportId = parseInt(req.query.transportId, null);
      const driverId = parseInt(req.query.driverId, null);
      const userId = parseInt(req.query.userId, null);
      const search = req.query.search;

      const url = await this.requests.export(periodStart, periodEnd, statusId, transportId, driverId, userId, search);
      res.download(url, (error) => {
        if (!error) {
          fs.unlink(url, (err) => {
            if (err) throw err;
          });
        }
      });
    };
  }
}
