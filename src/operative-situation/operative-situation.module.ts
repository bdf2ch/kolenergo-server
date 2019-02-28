import { MiddlewaresConsumer, Module, RequestMethod } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { OperativeSituationService } from './operative-situation.service';
import { OperativeSituationController } from './operative-situation.controller';
import { ExportReportMiddleware } from './middleware/export-report.middleware';

@Module({
  imports: [
    CommonModule,
  ],
  components: [
    OperativeSituationService,
  ],
  controllers: [
    OperativeSituationController,
  ],
  exports: [
    OperativeSituationService,
  ],
})
export class OperativeSituationModule {
  configure(consumer: MiddlewaresConsumer): MiddlewaresConsumer | void {
    consumer
      .apply(ExportReportMiddleware)
      .forRoutes({ path: 'osr/export', method: RequestMethod.GET });
  }
}