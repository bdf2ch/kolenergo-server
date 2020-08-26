import {Body, Controller, Delete, Get, Patch, Post, Query, Req} from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { IRequest, IRequestComment, Request, RequestComment } from '@kolenergo/auto';
import { RequestsService } from './requests.service';

@Controller('auto-mrsk/requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get('/')
  async getRequests(
    // @Query('periodStart') periodStart: number,
    // @Query('periodEnd') periodEnd: number,
    // @Query('departmentId') departmentId: number,
    @Query('date') date: string,
    @Query('transportTypeId') transportTypeId: number,
    @Query('statusId') statusId: number,
    @Query('transportId') transportId: number,
    @Query('driverId') driverId: number,
    @Query('userId') userId: number,
    @Query('search') search: string,
  ): Promise<IServerResponse<IRequest[]>> {
    return await this.requestsService.getRequests(
      // periodStart,
      // periodEnd,
      // departmentId,
      date,
      transportTypeId ? transportTypeId : 0,
      statusId ? statusId : 0,
      transportId ? transportId : 0,
      driverId ? driverId : 0,
      userId ? userId : 0,
      search ? search : null,
    );
  }

  @Post('/')
  async addRequest(
    @Body() request: Request,
    @Query('date') date: string,
    @Req() req
  ): Promise<IServerResponse<IRequest[]>> {
    request.user = req.user ? req.user.data : null;
    return await this.requestsService.addRequest(request, date);
  }

  @Patch('/:id')
  async editRequest(@Body() request: Request): Promise<IServerResponse<IRequest>> {
    return await this.requestsService.editRequest(request);
  }

  @Delete('/:id')
  async removeRequest(request: Request): Promise<IServerResponse<boolean>> {
    return await this.requestsService.removeRequest(request);
  }

  @Post('/:id/comment')
  async addComment(comment: RequestComment): Promise<IServerResponse<IRequestComment>> {
    return await this.requestsService.addComment(comment);
  }
}
