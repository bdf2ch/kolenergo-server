import {Controller, Get, HttpStatus, Post, Req, Res, UnauthorizedException, UseFilters, HttpCode} from '@nestjs/common';
import { AuthenticationExceptionFilter } from './filters/authentication.filter';
import { AuthenticationService } from './authentication.service';
import { LDAPService } from './ldap.service';

@Controller('authentication')
@UseFilters(new AuthenticationExceptionFilter())
export class AuthenticationController {

    constructor(private readonly authenticationService: AuthenticationService,
                private readonly ldapAuthenticationService: LDAPService) {}

    @Get()
    check() {}

    @Post('login')
    logIn() {}

    @Get('logout')
    logOut() {}
}
