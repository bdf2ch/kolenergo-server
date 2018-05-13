import { Module } from '@nestjs/common';
import { DataBaseModule } from '../database/database.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
    imports: [DataBaseModule],
    components: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}