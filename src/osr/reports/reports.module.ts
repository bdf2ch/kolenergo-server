import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

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
export class ReportsModule {}
