import { Controller, Post, Get, Body, Param, Query, Delete, Patch } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { IServerResponse } from '@kolenergo/lib';
import { ICompany } from '@kolenergo/cpa';

@Controller('cp/companies')
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) {
    }

    @Get('/')
    async getApplications(): Promise<IServerResponse<ICompany[]>> {
        const result = await this.companiesService.getCompanies();
        return result;
    }

    /*
    @Post('/roles')
    async addRole(@Body() role: IRole): Promise<IServerResponse<IRole>> {
        const result = await this.applicationsService.addRole(role);
        return result;
    }

    @Patch('/roles/:id')
    async editRole(@Body() role: IRole): Promise<IServerResponse<IRole>> {
        const result = await this.applicationsService.editRole(role);
        return result;
    }

    @Post('/permissions')
    async addPermission(@Body() permission: IPermission): Promise<IServerResponse<IPermission>> {
        const result = await this.applicationsService.addPermission(permission);
        return result;
    }

    @Patch('/permissions/:id')
    async editPermission(@Body() permission: IPermission): Promise<IServerResponse<IPermission>> {
        const result = await this.applicationsService.editPermission(permission);
        return result;
    }
    */
}