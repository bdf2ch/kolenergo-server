import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';

@Module({
  imports: [
    CommonModule,
  ],
  components: [
    DriversService,
  ],
  controllers: [
    DriversController,
  ],
  exports: [
    DriversService,
  ],
})
export class DriversModule {}
