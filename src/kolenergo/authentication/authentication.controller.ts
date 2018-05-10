import {Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';

@Controller('authentication')
export class AuthenticationController {

    constructor(private authenticationService: AuthenticationService) {}

    @Get()
    async check(@Req() request, @Res() response): Promise<any> {
        //const result = await this.authenticationService.check(request.user);
        response.send(request.user);
    }

    @Post('login')
    logIn(@Req() request, @Res() response): Promise<any> {
        //return request.user;
        //return null;
        response.send(request.user);
    }

    @Get('logout')
    logOut(@Res() response): void {
        response.send(null);
    }
}
