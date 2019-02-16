import { Controller, Post, Get, Body, Param, Query, Delete, Patch } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { IServerResponse, ICompany, IDepartment, IOffice, IOfficeLocation, IDivision } from '@kolenergo/cpa';

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

    @Patch('/:id')
    async editCompany(@Body() company: ICompany): Promise<IServerResponse<ICompany>> {
        const result = await this.companiesService.editCompany(company);
        return result;
    }

    @Delete('/:id')
    async deleteCompany(@Param('id') companyId: number): Promise<IServerResponse<boolean>> {
        const result = await this.companiesService.deleteCompany(companyId);
        return result;
    }

    @Post('/offices')
    async addOffice(@Body() office: IOffice): Promise<IServerResponse<IOffice>> {
        const result = await this.companiesService.addOffice(office);
        return result;
    }

    @Post('/departments')
    async addDepartment(@Body() department: IDepartment): Promise<IServerResponse<IDepartment>> {
        const result = await this.companiesService.addDepartment(department);
        return result;
    }

    @Patch('/departments/:id')
    async editDepartment(@Body() department: IDepartment): Promise<IServerResponse<IDepartment>> {
        const result = await this.companiesService.editDepartment(department);
        return result;
    }

    @Delete('/departments/:id')
    async deleteDepartment(@Param('id') departmentId: number): Promise<IServerResponse<boolean>> {
        const result = await this.companiesService.deleteDepartment(departmentId);
        return result;
    }

    @Patch('/offices/:id')
    async editOffice(@Body() office: IOffice): Promise<IServerResponse<IOffice>> {
        const result = await this.companiesService.editOffice(office);
        return result;
    }

    @Delete('/offices/:id')
    async deleteOffice(@Param('id') officeId: number): Promise<IServerResponse<boolean>> {
        const result = await this.companiesService.deleteOffice(officeId);
        return result;
    }

    @Post('/locations')
    async addLocation(@Body() location: IOfficeLocation): Promise<IServerResponse<IOfficeLocation>> {
        const result = await this.companiesService.addLocation(location);
        return result;
    }

    @Patch('/locations/:id')
    async editLocation(@Body() location: IOfficeLocation): Promise<IServerResponse<IOfficeLocation>> {
        const result = await this.companiesService.editLocation(location);
        return result;
    }

    @Delete('/locations/:id')
    async deleteLocation(@Param('id') locationId: number): Promise<IServerResponse<boolean>> {
        const result = await this.companiesService.deleteLocation(locationId);
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
}