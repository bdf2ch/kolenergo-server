import { Module } from '@nestjs/common';
import { DataBaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        DataBaseModule,
        MailModule,
        AuthenticationModule,
        UsersModule,
    ],
    components: [],
    controllers: [],
    exports: [],
})
export class CommonModule {}