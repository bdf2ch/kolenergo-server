import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';

@Module({
  imports: [
    CommonModule,
  ],
  components: [
    ArticlesService,
  ],
  controllers: [
    ArticlesController,
  ],
  exports: [
    ArticlesService,
  ],
})
export class ArticlesModule {}
