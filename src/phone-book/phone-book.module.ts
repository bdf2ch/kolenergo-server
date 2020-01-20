import { Module } from '@nestjs/common';

import { PhoneBookController } from './phone-book.controller';
import { PhoneBookService } from './phone-book.service';
import { DataBaseModule } from '../common/database/database.module';

@Module({
    imports: [DataBaseModule],
    components: [PhoneBookService],
    controllers: [PhoneBookController],
    exports: [PhoneBookService],
})
export class PhoneBookModule {}
