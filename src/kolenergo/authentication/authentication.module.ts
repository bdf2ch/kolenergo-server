import { MiddlewaresConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthenticationStrategy } from './local.strategy';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { LogInMiddleware } from './middleware/login.middleware';
import { LogOutMiddleware } from './middleware/logout.middleware';


@Module({
    imports: [],
    components: [
        AuthenticationStrategy,
        AuthenticationService,
    ],
    controllers: [AuthenticationController],
    exports: [AuthenticationService],
})
export class AuthenticationModule implements NestModule {
    configure(consumer: MiddlewaresConsumer): MiddlewaresConsumer | void {
        //consumer
        //    .apply(passport.authenticate('local', { session: true, failureFlash: true }))
        //    .forRoutes({ path: '*', method: RequestMethod.ALL });
        consumer
            .apply(LogInMiddleware)
            .forRoutes({ path: 'authentication/login', method: RequestMethod.POST });
        consumer
            .apply(LogOutMiddleware)
            .forRoutes({ path: 'authentication/logout', method: RequestMethod.GET });
    }
}