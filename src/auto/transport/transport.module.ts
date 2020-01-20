import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { TransportService } from './transport.service';
import { TransportController } from './transport.controller';

@Module({
  imports: [
    CommonModule,
  ],
  components: [
    TransportService,
  ],
  controllers: [
    TransportController,
  ],
  exports: [
    TransportService,
  ],
})
export class TransportModule {}
