import { Middleware, NestMiddleware } from '@nestjs/common';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';
import { Response } from 'express';
import { OperativeSituationService } from '../operative-situation.service';
import * as fs from 'fs';

@Middleware()
export class ExportReportMiddleware implements NestMiddleware {
  constructor(private readonly operativeSituationService: OperativeSituationService) {}

  async resolve(...args: any[]): AsyncExpressMiddleware {
    return async (req, res: Response, next) => {
      const date = req.query.date;
      const period = req.query.period;
      const url = await this.operativeSituationService.exportReport(date, period);
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
