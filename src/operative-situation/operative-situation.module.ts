import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { OperativeSituationService } from './operative-situation.service';
import { OperativeSituationController } from './operative-situation.controller';

@Module({
  imports: [
    CommonModule,
  ],
  components: [
    OperativeSituationService,
  ],
  controllers: [
    OperativeSituationController,
  ],
  exports: [
    OperativeSituationService,
  ],
})
export class OperativeSituationModule {}