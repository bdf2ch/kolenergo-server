import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KolenergoModule } from './kolenergo/kolenergo.module';
import { PhoneBookModule } from './phone-book/phone-book.module';
import { AppController } from './app.controller';

@Module({
  imports: [
      TypeOrmModule.forRoot(),
      KolenergoModule,
      PhoneBookModule,
  ],
  controllers: [AppController],
  components: [],
})
export class AppModule {}
