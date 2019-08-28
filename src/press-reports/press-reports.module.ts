import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { PressReportsService } from './press-reports.service';
import { PressReportsController } from './press-reports.controller';

@Module({
  imports: [
    CommonModule,
  ],
  components: [
    PressReportsService,
  ],
  controllers: [
    PressReportsController,
  ],
  exports: [
    PressReportsService,
  ],
})
export class PressReportsModule {}
