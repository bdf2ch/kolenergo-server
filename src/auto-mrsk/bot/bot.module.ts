import { Module } from '@nestjs/common';

import { BotService } from './bot.service';
import { AuthenticationModule } from '../../common/authentication/authentication.module';
import { UsersModule } from '../../common/users/users.module';
import { RequestsModule } from '../requests/requests.module';
import { DataBaseModule } from '../../common/database/database.module';

@Module({
  imports: [
    AuthenticationModule,
    DataBaseModule,
    UsersModule,
    RequestsModule,
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
