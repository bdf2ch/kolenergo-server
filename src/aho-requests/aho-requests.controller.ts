import { Controller, Post, Get, Body, Param, Query, Delete, Patch} from '@nestjs/common';
import { AhoRequestsService } from './aho-requests.service';
import {
    IAhoRequestType,
    IAhoRequest,
    IAddAhoRequest,
    IAhoRequestStatus,
    IAhoRequestTaskContent,
    IAhoRequestComment,
    IAhoRequestNeed,
} from '@kolenergo/aho';
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

    @Get('/needs')
    async getNeeds(): Promise<IAhoRequestNeed[]> {
        const result = this.ahoRequestsService.getNeeds();
        return result;
    }

    @Get('/needs/export')
    exportNeeds() {}

    @Get('/requests')
    async getRequests(
        @Query('start') start,
        @Query('end') end,
        @Query('employeeId') employeeId,
        @Query('requestTypeId') requestTypeId,
        @Query('requestStatusId') requestStatusId,
        @Query('search') search,
    ): Promise<IAhoRequest[]> {
        if (search) {
            const result = await this.ahoRequestsService.searchRequests(search);
            return result;
        } else {
            const result = await this.ahoRequestsService.getRequests(start, end, employeeId, requestTypeId, requestStatusId);
            return result;
        }
    }

    @Get('/requests/export')
    exportRequests() {}

    @Get('/requests/:id')
    async getRequestById(@Param() params): Promise<IAhoRequest | null> {
        const result = this.ahoRequestsService.getRequestById(params.id);
        return result;
    }

    @Patch('/requests/:id')
    async editRequest(@Body() request, @Param() params): Promise<IAhoRequest | null> {
        const result = this.ahoRequestsService.editRequest(request);
        return result;
    }

    @Delete('/requests/:id')
    async deleteRequest(@Param() params): Promise<boolean> {
        console.log('edit request', params);
        const result = this.ahoRequestsService.deleteRequest(params.id);
        return result;
    }

    @Post('/requests/:id/comments')
    async addComment(@Body() comment, @Param() params): Promise<IAhoRequestComment | null> {
        const result = await this.ahoRequestsService.addComment(comment);
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