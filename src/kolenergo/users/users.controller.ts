import { Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async findAll(): Promise<any> {
        return await this.usersService.findAll();
    }

    @Post()
    addUser(): Promise<any> {
        return null;
    }
}