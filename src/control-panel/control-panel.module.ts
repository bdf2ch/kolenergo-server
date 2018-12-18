import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { CompaniesModule } from './companies/companies.module';
import { ApplicationsModule } from './applications/applications.module';
import { ControlPanelService } from './control-panel.service';
import { ControlPanelController } from './control-panel.controller';

@Module({
    imports: [
        CommonModule,
        CompaniesModule,
        ApplicationsModule,
    ],
    components: [
        ControlPanelService,
    ],
    controllers: [
        ControlPanelController,
    ],
    exports: [
        CompaniesModule,
        ApplicationsModule,
        ControlPanelService,
    ],
})
export class ControlPanelModule {}