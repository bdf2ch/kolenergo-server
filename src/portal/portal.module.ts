import { MiddlewaresConsumer, Module, RequestMethod } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { PortalService } from './portal.service';
import { PortalController } from './portal.controller';
import { AdvertsModule } from './adverts/adverts.module';

@Module({
  imports: [
    CommonModule,
    AdvertsModule,
  ],
  components: [
    PortalService,
  ],
  controllers: [
    PortalController,
  ],
  exports: [
    PortalService,
  ],
})
export class PortalModule {}
