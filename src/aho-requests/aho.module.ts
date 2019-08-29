import { MiddlewaresConsumer, Module, RequestMethod } from '@nestjs/common';
import { DataBaseModule } from '../common/database/database.module';
import { MailModule } from '../common/mail/mail.module';
import { AhoRequestsService } from './aho-requests.service';
import { AhoRequestsServiceNew } from './aho-requests_.service';
import { AhoRequestsController } from './aho-requests.controller';
import { ExportNeedsMiddleware } from './middleware/export-needs.middleware';
import { ExportRequestsMiddleware } from './middleware/export-requests.middleware';
import { ExportRequestMiddleware } from './middleware/export-request.middleware';
import { AhoRequestsControllerNew } from './aho-requests_.controller';

@Module({
    imports: [
        DataBaseModule,
        MailModule,
    ],
    components: [
      AhoRequestsService,
        AhoRequestsServiceNew,
    ],
    controllers: [
      AhoRequestsController,
        // AhoRequestsControllerNew,
    ],
    exports: [
      AhoRequestsService,
    ],
})
export class AhoRequestsModule {
    configure(consumer: MiddlewaresConsumer): MiddlewaresConsumer | void {
        consumer
            .apply(ExportNeedsMiddleware)
            .forRoutes({ path: 'aho/needs/export', method: RequestMethod.GET });
        consumer
            .apply(ExportRequestsMiddleware)
            .forRoutes({ path: 'aho/requests/export', method: RequestMethod.GET });
        consumer
            .apply(ExportRequestMiddleware)
            .forRoutes({ path: 'aho/requests/:id/export', method: RequestMethod.GET });
    }
}
