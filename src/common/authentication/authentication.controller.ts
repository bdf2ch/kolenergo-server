import {Controller, Get, HttpStatus, Post, Req, Res, UnauthorizedException, UseFilters} from '@nestjs/common';
import { AuthenticationExceptionFilter } from './filters/authentication.filter';
import { AuthenticationService } from './authentication.service';
import { LDAPAuthenticationService } from './ldap.service';

@Controller('authentication')
export class AuthenticationController {

    constructor(private readonly authenticationService: AuthenticationService,
                private readonly ldapAuthenticationService: LDAPAuthenticationService) {}

    @Get()
    check(@Req() request, @Res() response): void {
        if (request.isAuthenticated()) {
            response.status(HttpStatus.OK).json(request.user);
        } else {
            response.status(HttpStatus.OK).status(HttpStatus.UNAUTHORIZED).json(null);
        }
    }

    @Post('login')
    //@UseFilters(new AuthenticationExceptionFilter())
    logIn(@Req() request, @Res() response): void {
        if (request.isAuthenticated()) {
            response.status(HttpStatus.OK).json(request.user);
        } else {
            response.status(HttpStatus.UNAUTHORIZED).json(null);
        }
    }

    @Get('logout')
    logOut(@Req() request, @Res() response): void {
        if (request.isAuthenticated()) {
            request.logOut();
        }
        response.status(HttpStatus.OK).json(null);
    }
}
