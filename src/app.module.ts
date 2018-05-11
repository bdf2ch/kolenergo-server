import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { PhoneBookModule } from './phone-book/phone-book.module';
import { AppController } from './app.controller';

@Module({
  imports: [
      CommonModule,
      PhoneBookModule,
  ],
  controllers: [AppController],
  components: [],
})
export class AppModule {}
