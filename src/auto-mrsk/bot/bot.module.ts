import { Module } from '@nestjs/common';

import { BotService } from './bot.service';
import { AuthenticationModule } from '../../common/authentication/authentication.module';

@Module({
  imports: [
    AuthenticationModule,
  ],
  components: [
    BotService,
  ],
  controllers: [],
  exports: [
    BotService,
  ],
})
export class BotModule {}
