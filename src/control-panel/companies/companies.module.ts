import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { DataBaseModule } from '../../common/database/database.module';

@Module({
    imports: [
        DataBaseModule,
    ],
    controllers: [
        CompaniesController,
    ],
    components: [
        CompaniesService,
    ],
    exports: [
        CompaniesService,
    ],
})
export class CompaniesModule {}
