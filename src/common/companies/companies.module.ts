import { Module } from '@nestjs/common';
import { DataBaseModule } from '../database/database.module';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';

@Module({
  imports: [DataBaseModule],
  components: [CompaniesService],
  controllers: [CompaniesController],
  exports: [CompaniesService],
})
export class CompaniesModule {}
