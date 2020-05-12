import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { ConsumptionService } from './consumption.service';
import { ConsumptionController } from './consumption.controller';

@Module({
  imports: [
    CommonModule,
  ],
  components: [
    ConsumptionService,
  ],
  controllers: [
    ConsumptionController,
  ],
  exports: [
    ConsumptionService,
  ],
})
export class ConsumptionModule {}
