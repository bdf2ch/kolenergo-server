import { Response } from 'express';
import { Middleware, NestMiddleware } from '@nestjs/common';
import { AsyncExpressMiddleware } from '@nestjs/common/interfaces';
import { OperativeSituationService } from '../operative-situation.service';

@Middleware()
export class ExportReportMiddleware implements NestMiddleware {
  constructor(private readonly operativeSituationService: OperativeSituationService) {}

  async resolve(...args: any[]): AsyncExpressMiddleware {
    return async (req, res: Response, next) => {
      const reportId = req.params.id;
      const url = await this.operativeSituationService.exportReport(reportId);
      res.download(url);
    };
  }
}