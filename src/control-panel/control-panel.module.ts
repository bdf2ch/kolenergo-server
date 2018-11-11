import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { ApplicationsModule } from './applications/applications.module';

@Module({
    imports: [
        CommonModule,
        ApplicationsModule,
    ],
    components: [],
    controllers: [],
    exports: [
        ApplicationsModule,
    ],
})
export class ControlPanelModule {

}