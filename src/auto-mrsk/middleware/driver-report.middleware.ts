import { Middleware, NestMiddleware } from '@nestjs/common';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';

import * as fs from 'fs';
import { Response } from 'express';

import { RequestsService } from '../requests/requests.service';

@Middleware()
export class DriverReportMiddleware implements NestMiddleware {
  constructor(private readonly requests: RequestsService) {}

  async resolve(...args: any[]): AsyncExpressMiddleware {
    return async (req, res: Response, next) => {
      const periodStart = parseInt(req.query.periodStart, null);
      const periodEnd = parseInt(req.query.periodEnd, null);
      const driverId = parseInt(req.query.driverId, null);

      const url = await this.requests.loadDriverReport(periodStart, periodEnd, driverId);
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
