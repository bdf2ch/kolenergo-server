import {Controller, Get, HttpStatus, Param, Post, Query, Res} from '@nestjs/common';
import { IServerResponse, IUser } from '@kolenergo/core';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    /*
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
    */

    /**
     * GET /users/:id
     */
    @Get(':id')
    async getById(
      @Param('id') userId: number,
      @Query('withCompany') withCompany: boolean,
      @Query('withDepartment') withDepartment: boolean,
      @Query('applicationCode') applicationCode: string,
      @Res() response): Promise<any> {
        const result = await this.usersService.getById(userId, withCompany , withDepartment, applicationCode);
        response.status(result ? HttpStatus.OK : HttpStatus.NOT_FOUND).json(result);
    }

    /**
     * GET /users?query=&&withCompany=&&withDepartment=
     */
    @Get()
    async search(
      @Query('query') query: string,
      @Query('withCompany') withCompany: boolean,
      @Query('withDepartment') withDepartment: boolean,
    ): Promise<IServerResponse<IUser[]>> {
        const result = await this.usersService.search(query, withCompany, withDepartment);
        return  result;
    }

    /**
     * POST /users
     */
    @Post()
    async addUser(): Promise<any> {
        return null;
    }
}
