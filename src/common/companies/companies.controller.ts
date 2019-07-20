import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IServerResponse, ICompany } from '@kolenergo/core';
import { CompaniesService } from './companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  /**
   * GET /companies
   * @param withDepartments
   */
  @Get()
  async getAll(@Query('withDepartments') withDepartments: boolean): Promise<IServerResponse<ICompany[]>> {
      const result = await this.companiesService.getAll(withDepartments ? withDepartments : false);
      return result;
  }

  /**
   * GET /users/:id
   */
  /*
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
   */

  /**
   * GET /users?query=&&withCompany=&&withDepartment=
   */
  /*
  @Get()
  async search(
    @Query('query') query: string,
    @Query('withCompany') withCompany: boolean,
    @Query('withDepartment') withDepartment: boolean,
  ): Promise<IServerResponse<IUser[]>> {
    const result = await this.usersService.search(query, withCompany, withDepartment);
    return  result;
  }
   */

  /**
   * POST /users
   */
  /*
  @Post()
  async addUser(): Promise<any> {
    return null;
  }
   */
}
