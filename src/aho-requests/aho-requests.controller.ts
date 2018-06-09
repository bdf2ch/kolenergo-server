import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { AhoRequestsService } from './aho-requests.service';
import { IAhoRequestType, IAhoRequest, IAddAhoRequest, IAhoRequestStatus, IAhoRequestTaskContent } from '@kolenergo/aho';
import { IUser } from '@kolenergo/lib';

@Controller('aho')
export class AhoRequestsController {
    constructor(private readonly ahoRequestsService: AhoRequestsService) {}

    @Get('/types')
    async getRequestTypes(): Promise<IAhoRequestType[]> {
        const result = await this.ahoRequestsService.getRequestTypes();
        return result;
    }

    @Get('/statuses')
    async getRequestStatuses(): Promise<IAhoRequestStatus[]> {
        const result = this.ahoRequestsService.getRequestStatuses();
        return result;
    }

    @Get('/tasks')
    async getTasksContent(): Promise<IAhoRequestTaskContent[]> {
        const result = this.ahoRequestsService.getRequestTasksContent();
        return result;
    }

    @Get('/requests')
    async getRequests(@Query('statusId') statusId): Promise<IAhoRequest[]> {
        if (statusId) {
            const result = await this.ahoRequestsService.getRequestsByStatusId(statusId);
            return result;
        }
        const result = await this.ahoRequestsService.getRequests();
        return result;
    }

    @Get('/requests/:id')
    async getRequestById(@Param() params): Promise<IAhoRequest | null> {
        const result = this.ahoRequestsService.getRequestById(params.id);
        return result;
    }

    /*
    @Get('/requests/*')
    async getRequestsByStatusId(@Query('statusId') statusId): Promise<IAhoRequest[]> {
        console.log('statusId', statusId);
        const result = this.ahoRequestsService.getRequestsByStatusId(+statusId);
        return result;
    }
    */

    @Post('/requests')
    async addRequest(@Body() request: IAddAhoRequest): Promise<IAhoRequest> {
        const result = await this.ahoRequestsService.addRequest(request);
        return result;
    }
}