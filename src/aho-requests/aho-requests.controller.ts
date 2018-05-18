import {Controller, Post, Get, Body, Param} from '@nestjs/common';
import { AhoRequestsService } from './aho-requests.service';
import { IAhoRequestType, IAhoRequest, IAddAhoRequest, IAhoRequestStatus } from '@kolenergo/aho';

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

    @Get('/requests')
    async getRequests(): Promise<IAhoRequest[]> {
        const result = await this.ahoRequestsService.getRequests();
        return result;
    }

    @Get('/requests/:id')
    async getRequestById(@Param() params): Promise<IAhoRequest | null> {
        const result = this.ahoRequestsService.getRequestById(params.id);
        return result;
    }

    @Post('/requests')
    async addRequest(@Body() request: IAddAhoRequest): Promise<IAhoRequest> {
        const result = await this.ahoRequestsService.addRequest(request);
        return result;
    }
}