import { Controller, Post, Get, Body, Param, Query, Delete, Patch } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import {IServerResponse, ICompany, IOffice, IDivision} from '@kolenergo/cpa';

@Controller('cp/companies')
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) {
    }

    @Get('/')
    async getCompanies(): Promise<IServerResponse<ICompany[]>> {
        const result = await this.companiesService.getCompanies();
        return result;
    }

    @Post('/')
    async addCompany(@Body() company: ICompany): Promise<IServerResponse<ICompany>> {
        const result = await this.companiesService.addCompany(company);
        return result;
    }

    @Post('/offices')
    async addOffice(@Body() office: IOffice): Promise<IServerResponse<IOffice>> {
        const result = await this.companiesService.addOffice(office);
        return result;
    }

    @Post('/divisions')
    async addDivision(@Body() division: IDivision): Promise<IServerResponse<IDivision>> {
        const result = await this.companiesService.addDivision(division);
        return result;
    }

    @Patch('/divisions/:id')
    async editPermission(@Body() division: IDivision): Promise<IServerResponse<IDivision>> {
        const result = await this.companiesService.editDivision(division);
        return result;
    }

    @Delete('/divisions/:id')
    async deleteDivision(@Param('id') divisionId: number): Promise<IServerResponse<boolean>> {
        const result = await this.companiesService.deleteDivision(divisionId);
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

    @Patch('/permissions/:id')
    async editPermission(@Body() permission: IPermission): Promise<IServerResponse<IPermission>> {
        const result = await this.applicationsService.editPermission(permission);
        return result;
    }
    */
}