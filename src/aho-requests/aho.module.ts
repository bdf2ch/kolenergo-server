import { MiddlewaresConsumer, Module, RequestMethod } from '@nestjs/common';
import { DataBaseModule } from '../common/database/database.module';
import { AhoRequestsService } from './aho-requests.service';
import { AhoRequestsController } from './aho-requests.controller';
import { ExportNeedsMiddleware } from './middleware/export-needs.middleware';

@Module({
    imports: [DataBaseModule],
    components: [AhoRequestsService],
    controllers: [AhoRequestsController],
    exports: [AhoRequestsService],
})
export class AhoRequestsModule {
    configure(consumer: MiddlewaresConsumer): MiddlewaresConsumer | void {
        consumer
            .apply(ExportNeedsMiddleware)
            .forRoutes({ path: 'aho/needs/export', method: RequestMethod.GET });
    }
}
