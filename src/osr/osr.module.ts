import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { ReportsModule } from './reports/reports.module';
import { ConsumptionModule } from './consumption/consumption.module';
import { WeatherModule } from './weather/weather.module';
import { OSRService } from './osr.service';
import { OSRController } from './osr.controller';

@Module({
  imports: [
    CommonModule,
    ReportsModule,
    ConsumptionModule,
    WeatherModule,
  ],
  components: [
    OSRService,
  ],
  controllers: [
    OSRController,
  ],
  exports: [
    OSRService,
  ],
})
export class OSRModule {}
