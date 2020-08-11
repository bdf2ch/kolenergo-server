import { Module } from '@nestjs/common';

import { CommonModule } from './common/common.module';
import { AhoRequestsModule } from './aho-requests/aho.module';
import { PhoneBookModule } from './phone-book/phone-book.module';
import { OperativeSituationModule } from './operative-situation/operative-situation.module';
import { OSRModule } from './osr/osr.module';
import { ControlPanelModule } from './control-panel/control-panel.module';
import { EventShedulerModule } from './event-sheduler/event-sheduler.module';
import { AppController } from './app.controller';
import { PressReportsModule } from './press-reports/press-reports.module';
import { PortalModule } from './portal/portal.module';
import { MessengerModule } from './messenger/messenger.module';
import { AutoModule } from './auto-mrsk/auto.module';

@Module({
  imports: [
      CommonModule,
      AhoRequestsModule,
      PhoneBookModule,
      OperativeSituationModule,
      OSRModule,
      EventShedulerModule,
      ControlPanelModule,
      PressReportsModule,
      PortalModule,
      MessengerModule,
      AutoModule,
  ],
  controllers: [
    AppController,
  ],
  components: [],
})
export class AppModule {}
