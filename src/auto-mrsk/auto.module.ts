import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { RequestsModule } from './requests/requests.module';
import { DriversModule } from './drivers/drivers.module';
import { TransportModule } from './transport/transport.module';
import { AutoService } from './auto.service';
import { AutoController } from './auto.controller';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    CommonModule,
    RequestsModule,
    TransportModule,
    DriversModule,
    BotModule,
  ],
  components: [
    AutoService,
  ],
  controllers: [
    AutoController,
  ],
  exports: [
    AutoService,
  ],
})
export class AutoModule {}
