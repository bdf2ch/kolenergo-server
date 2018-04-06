import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhoneBookModule } from './phone-book/phone-book.module';
import { AppController } from './app.controller';

@Module({
  imports: [
      TypeOrmModule.forRoot(),
      PhoneBookModule,
  ],
  controllers: [AppController],
  components: [],
})
export class AppModule {}
