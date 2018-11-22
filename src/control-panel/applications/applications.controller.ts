import { Controller, Post, Get, Body, Param, Query, Delete, Patch } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { IPermission, IServerResponse } from '@kolenergo/lib';
import { IApplication } from '@kolenergo/cp';

@Controller('cp/applications')
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) {}

    @Get('/')
    async getApplications(): Promise<IServerResponse<IApplication[]>> {
        const result = await this.applicationsService.getApplications();
        return result;
    }

    @Patch('/permissions/:id')
    async editPermission(@Body() permission: IPermission): Promise<IServerResponse<IPermission>> {
        const result = await this.applicationsService.editPermission(permission);
        return result;
    }
}