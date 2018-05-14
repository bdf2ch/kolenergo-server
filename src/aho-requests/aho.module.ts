import { Module } from '@nestjs/common';
import { DataBaseModule } from '../common/database/database.module';
import { AhoRequestsService } from './aho-requests.service';
import { AhoRequestsController } from './aho-requests.controller';

@Module({
    imports: [DataBaseModule],
    components: [AhoRequestsService],
    controllers: [AhoRequestsController],
    exports: [AhoRequestsService],
})
export class AhoRequestsModule {}