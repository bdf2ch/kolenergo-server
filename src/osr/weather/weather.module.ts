import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';

@Module({
  imports: [
    CommonModule,
  ],
  components: [
    WeatherService,
  ],
  controllers: [
    WeatherController,
  ],
  exports: [
    WeatherService,
  ],
})
export class WeatherModule {}
