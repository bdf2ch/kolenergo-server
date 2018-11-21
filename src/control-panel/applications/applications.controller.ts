import { Controller, Post, Get, Body, Param, Query, Delete, Patch} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { IServerResponse } from '@kolenergo/lib';
import { IApplication } from '@kolenergo/cp';

@Controller('cp/applications')
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) {}

    @Get('/')
    async getApplications(): Promise<IServerResponse<IApplication[]>> {
        const result = await this.applicationsService.getApplications();
        return result;
    }
}