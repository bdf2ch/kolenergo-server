import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { PortalService } from './portal.service';
import { PortalController } from './portal.controller';
import { AdvertsModule } from './adverts/adverts.module';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [
    CommonModule,
    AdvertsModule,
    ArticlesModule,
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
