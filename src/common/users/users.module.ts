import { Module } from '@nestjs/common';
import { PostgresModule } from '../database/database.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
    imports: [PostgresModule],
    components: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}