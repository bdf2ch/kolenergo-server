import {MiddlewaresConsumer, Module, RequestMethod} from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import {ExportReportMiddleware} from '../middleware/export-report.middleware';

@Module({
  imports: [
    CommonModule,
  ],
  components: [
    ReportsService,
  ],
  controllers: [
    ReportsController,
  ],
  exports: [
    ReportsService,
  ],
})
export class ReportsModule {
  configure(consumer: MiddlewaresConsumer): MiddlewaresConsumer | void {
    consumer
      .apply(ExportReportMiddleware)
      .forRoutes({ path: 'osr2/reports/export', method: RequestMethod.GET });
  }
}
