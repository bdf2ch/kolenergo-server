import { MiddlewaresConsumer, Module, RequestMethod } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { AdvertsService } from './adverts.service';
import { AdvertsController } from './adverts.controller';
import { UploadImageMiddleware } from './middleware/upload-image.middleware';

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
export class AdvertsModule {
  /*
  configure(consumer: MiddlewaresConsumer): MiddlewaresConsumer | void {
    consumer
      .apply(UploadImageMiddleware)
      .forRoutes({ path: 'portal/adverts/image', method: RequestMethod.POST });
  }
   */
}
