import { Middleware, NestMiddleware } from '@nestjs/common';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';

import * as fs from 'fs';
import { Response } from 'express';
import * as moment from 'moment';

import { ReportsService } from '../reports/reports.service';

@Middleware()
export class ExportReportMiddleware implements NestMiddleware {
  constructor(private readonly reports: ReportsService) {}

  async resolve(...args: any[]): AsyncExpressMiddleware {
    return async (req, res: Response, next) => {
      const date = moment().format('DD.MM.YYYY');
      const time = moment(`${date} ${req.query.time}`, 'DD.MM.YYYY HHmm').format('HH:mm');
      const url = await this.reports.export(date, time);
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
