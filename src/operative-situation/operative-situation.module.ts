import { MiddlewaresConsumer, Module, RequestMethod } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { OperativeSituationService } from './operative-situation.service';
import { OperativeSituationController } from './operative-situation.controller';
import { OperativeSituationController2 } from './operative-situation2.controller';
import { ExportReportMiddleware } from './middleware/export-report.middleware';
import { OperativeSituationService2 } from './operative-situation2.service';

@Module({
  imports: [
    CommonModule,
  ],
  components: [
    OperativeSituationService,
    // OperativeSituationService2,
  ],
  controllers: [
    OperativeSituationController,
    // OperativeSituationController2,
  ],
  exports: [
    OperativeSituationService,
    // OperativeSituationService2,
  ],
})
export class OperativeSituationModule {
  configure(consumer: MiddlewaresConsumer): MiddlewaresConsumer | void {
    consumer
      .apply(ExportReportMiddleware)
      .forRoutes({ path: 'osr2/export', method: RequestMethod.GET });
  }
}
