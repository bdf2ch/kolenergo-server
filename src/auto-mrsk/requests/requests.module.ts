import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';

@Module({
  imports: [
    CommonModule,
  ],
  components: [
    RequestsService,
  ],
  controllers: [
    RequestsController,
  ],
  exports: [
    RequestsService,
  ],
})
export class RequestsModule {}
