import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        AuthenticationModule,
        UsersModule,
    ],
    components: [],
    controllers: [],
    exports: [],
})
export class KolenergoModule {}