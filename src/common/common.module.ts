import { Module } from '@nestjs/common';
import { DataBaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';
import { ApplicationsModule } from '../control-panel/applications/applications.module';
import { CompaniesModule } from './companies/companies.module';

@Module({
    imports: [
        DataBaseModule,
        MailModule,
        AuthenticationModule,
        UsersModule,
        ApplicationsModule,
        CompaniesModule,
    ],
    components: [],
    controllers: [],
    exports: [
        DataBaseModule,
        MailModule,
        AuthenticationModule,
        UsersModule,
        ApplicationsModule,
        CompaniesModule,
    ],
})
export class CommonModule {}
