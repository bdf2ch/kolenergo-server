import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { DataBaseModule } from '../../common/database/database.module';

@Module({
    imports: [
        DataBaseModule,
    ],
    controllers: [
        ApplicationsController,
    ],
    components: [
        ApplicationsService,
    ],
    exports: [
        ApplicationsService,
    ],
})
export class ApplicationsModule {}
