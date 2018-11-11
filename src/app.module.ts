import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AhoRequestsModule } from './aho-requests/aho.module';
import { PhoneBookModule } from './phone-book/phone-book.module';
import { ControlPanelModule } from './control-panel/control-panel.module';
import { AppController } from './app.controller';

@Module({
  imports: [
      CommonModule,
      AhoRequestsModule,
      PhoneBookModule,
      ControlPanelModule,
  ],
  controllers: [
    AppController,
  ],
  components: [],
})
export class AppModule {}
