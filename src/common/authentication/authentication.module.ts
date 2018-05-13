import { MiddlewaresConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthenticationStrategy } from './local.strategy';
import { AuthenticationService } from './authentication.service';
import { LDAPService } from './ldap.service';
import { AuthenticationController } from './authentication.controller';
import { LogInMiddleware } from './middleware/login.middleware';
import { LogOutMiddleware } from './middleware/logout.middleware';
import { CheckMiddleware } from './middleware/check.middleware';

@Module({
    imports: [
      UsersModule,
    ],
    components: [
        AuthenticationStrategy,
        AuthenticationService,
        LDAPService,
    ],
    controllers: [
      AuthenticationController,
    ],
    exports: [
      AuthenticationService,
    ],
})
export class AuthenticationModule implements NestModule {
    configure(consumer: MiddlewaresConsumer): MiddlewaresConsumer | void {
        consumer
            .apply(LogInMiddleware)
            .forRoutes({ path: 'authentication/login', method: RequestMethod.POST });
        consumer
            .apply(LogOutMiddleware)
            .forRoutes({ path: 'authentication/logout', method: RequestMethod.GET });
        consumer
            .apply(CheckMiddleware)
            .forRoutes({ path: 'authentication', method: RequestMethod.GET });
    }
}