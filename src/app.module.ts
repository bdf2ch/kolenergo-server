import { Module } from '@nestjs/common';
import { KolenergoModule } from './kolenergo/kolenergo.module';
import { PhoneBookModule } from './phone-book/phone-book.module';
import { AppController } from './app.controller';

@Module({
  imports: [
      KolenergoModule,
      PhoneBookModule,
  ],
  controllers: [AppController],
  components: [],
})
export class AppModule {}
