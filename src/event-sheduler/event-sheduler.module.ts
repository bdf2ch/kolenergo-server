import { MiddlewaresConsumer, Module, RequestMethod } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { EventShedulerService } from './event-sheduler.service';
import { EventShedulerController } from './event-sheduler.controller';

@Module({
  imports: [
    CommonModule,
  ],
  components: [
    EventShedulerService,
  ],
  controllers: [
    EventShedulerController,
  ],
  exports: [
    EventShedulerService,
  ],
})
export class EventShedulerModule {}
