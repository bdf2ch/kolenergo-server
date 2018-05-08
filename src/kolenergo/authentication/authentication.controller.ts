import { Controller, Get, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';

@Controller('authentication')
export class AuthenticationController {

    constructor(private authenticationService: AuthenticationService) {}

    @Get()
    async check(): Promise<any> {
        const result = await this.authenticationService.check();
        return result;
    }

    @Post('login')
    logIn(): Promise<any> {
        return null;
    }

    @Get()
    logOut(): Promise<any> {
        return null;
    }
}
