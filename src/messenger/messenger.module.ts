import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { MessagesModule } from './messages/messages.module';
import { MessengerService } from './messenger.service';
import { MessengerController } from './messenger.controller';

@Module({
  imports: [
    CommonModule,
    MessagesModule,
  ],
  components: [
    MessengerService,
  ],
  controllers: [
    MessengerController,
  ],
  exports: [
    MessengerService,
  ],
})
export class MessengerModule {}
