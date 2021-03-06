import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { AdvertsService } from './adverts.service';
import { AdvertsController } from './adverts.controller';

@Module({
  imports: [
    CommonModule,
  ],
  components: [
    AdvertsService,
  ],
  controllers: [
    AdvertsController,
  ],
  exports: [
    AdvertsService,
  ],
})
export class AdvertsModule {}
