import { Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async getAll(@Res() response): Promise<any> {
        const result = await this.usersService.getAll();
        response.status(HttpStatus.OK).json(result);
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