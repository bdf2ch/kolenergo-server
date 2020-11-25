import { MiddlewaresConsumer, Module, RequestMethod } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { ExportRequestsMiddleware } from '../middleware/export.middleware';
import { TransportReportMiddleware } from '../middleware/transport-report.middleware';
import { DriverReportMiddleware } from '../middleware/driver-report.middleware';

@Module({
  imports: [
    CommonModule,
  ],
  components: [
    RequestsService,
  ],
  controllers: [
    RequestsController,
  ],
  exports: [
    RequestsService,
  ],
})
export class RequestsModule {
  configure(consumer: MiddlewaresConsumer): MiddlewaresConsumer | void {
    consumer
      .apply(ExportRequestsMiddleware)
      .forRoutes({ path: 'auto-mrsk/requests/export', method: RequestMethod.GET });
    consumer
      .apply(TransportReportMiddleware)
      .forRoutes({ path: 'auto-mrsk/reports/transport', method: RequestMethod.GET });
    consumer
      .apply(DriverReportMiddleware)
      .forRoutes({ path: 'auto-mrsk/reports/driver', method: RequestMethod.GET });
  }
}
