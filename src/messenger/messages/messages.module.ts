import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { MessagesGatewayComponent } from './messages.gateway';
import { MessagesService } from './messages.service';

@Module({
  imports: [
    CommonModule,
  ],
  components: [
    MessagesService,
    MessagesGatewayComponent,
  ],
  controllers: [],
  exports: [
    MessagesService,
    MessagesGatewayComponent,
  ],
})
export class MessagesModule {}
