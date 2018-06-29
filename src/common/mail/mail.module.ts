import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
    imports: [],
    components: [MailService],
    controllers: [],
    exports: [MailService],
})
export class MailModule {}
