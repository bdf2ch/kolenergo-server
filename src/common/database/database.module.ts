import { Module } from '@nestjs/common';
import { PostgresService } from './postgres.service';

@Module({
    imports: [],
    components: [PostgresService],
    controllers: [],
    exports: [PostgresService],
})
export class DataBaseModule {}
