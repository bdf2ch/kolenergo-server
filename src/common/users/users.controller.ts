import {Controller, Get, HttpStatus, Param, Post, Query, Res} from '@nestjs/common';
import { UsersService } from './users.service';
import { IUser } from '@kolenergo/cpa';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async getAll(@Query('appCode') appCode): Promise<any> {
        if (appCode) {
            const result = await this.usersService.getByAppCode(appCode);
            return result;
        }
        const result = await this.usersService.getAll();
        return result;
        // response.status(HttpStatus.OK).json(result);
    }

    @Get(':id')
    async getById(@Param() params, @Res() response): Promise<any> {
        const result = await this.usersService.getById(params.id);
        response.status(result ? HttpStatus.OK : HttpStatus.NOT_FOUND).json(result);
    }

    @Post()
    async addUser(): Promise<any> {
        return null;
    }
}