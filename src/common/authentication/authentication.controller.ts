import {Controller, Get, Post, UseFilters} from '@nestjs/common';
import { AuthenticationExceptionFilter } from './filters/authentication.filter';

@Controller('authentication')
@UseFilters(new AuthenticationExceptionFilter())
export class AuthenticationController {

    @Get()
    check() {}

    @Post('login')
    logIn() {}

    @Get('logout')
    logOut() {}
}
