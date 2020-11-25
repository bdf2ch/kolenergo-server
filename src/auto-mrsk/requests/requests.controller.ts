import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { IRequest, IRequestComment, Request, RequestComment, IRoutePoint } from '@kolenergo/auto';
import { RequestsService } from './requests.service';

@Controller('auto-mrsk/requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get('/')
  async getRequests(
    @Query('periodStart') periodStart: number,
    @Query('periodEnd') periodEnd: number,
    // @Query('departmentId') departmentId: number,
    // @Query('date') date: string,
    @Query('transportTypeId') transportTypeId: number,
    @Query('statusId') statusId: number,
    @Query('transportId') transportId: number,
    @Query('driverId') driverId: number,
    @Query('userId') userId: number,
    @Query('search') search: string,
  ): Promise<IServerResponse<IRequest[]>> {
    return await this.requestsService.getRequests(
      periodStart,
      periodEnd,
      // departmentId,
      // date,
      transportTypeId ? transportTypeId : 0,
      statusId ? statusId : 0,
      transportId ? transportId : 0,
      driverId ? driverId : 0,
      userId ? userId : 0,
      search ? search : null,
    );
  }

  @Get('/calendar')
  async getNotifications(
    @Query('start') start: string,
    @Query('end') end: string,
    @Req() request,
  ): Promise<IServerResponse<{date: string, count: number}[]>> {
    const user = request.user ? request.user.data : null;
    return await this.requestsService.getNotifications(
      user ? user.id : 0,
      parseInt(start, null),
      parseInt(end, null),
    );
  }

  @Get('/export')
  async export() {}

  @Post('/')
  async addRequest(
    @Body() request: Request,
    @Query('date') date,
    @Query('periodStart') periodStart,
    @Query('periodEnd') periodEnd,
    @Req() req,
  ): Promise<IServerResponse<{
    request: IRequest,
    requests: IRequest[],
    userRequests: IRequest[],
    calendarRequests: {date: string, count: number}[],
    routes: IRoutePoint[],
  }>> {
    request.user = req.user ? req.user.data : null;
    return await this.requestsService.addRequest(
      request,
      date,
      parseInt(periodStart, null),
      parseInt(periodEnd, null),
    );
  }

  @Patch('/:id')
  async editRequest(
    @Body() request: Request,
    @Query('periodStart') periodStart,
    @Query('periodEnd') periodEnd,
    @Query('currentDate') currentDate,
  ): Promise<IServerResponse<IRequest>> {
    return await this.requestsService.editRequest(
      request,
      parseInt(periodStart, null),
      parseInt(periodEnd, null),
      currentDate,
      request.user ? request.user.id : 0,
    );
  }

  @Delete('/:id')
  async removeRequest(request: Request): Promise<IServerResponse<boolean>> {
    return await this.requestsService.removeRequest(request);
  }

  @Patch('/:id/cancel')
  async cancelRequest(
    @Param('id') requestId: string,
  ): Promise<IServerResponse<IRequest>> {
    return await this.requestsService.cancelRequest(parseInt(requestId, null));
  }

  @Patch('/:id/done')
  async doneRequest(
    @Param('id') requestId: string,
  ): Promise<IServerResponse<IRequest>> {
    return await this.requestsService.doneRequest(parseInt(requestId, null));
  }

  @Post('/:id/comment')
  async addComment(comment: RequestComment): Promise<IServerResponse<IRequestComment>> {
    return await this.requestsService.addComment(comment);
  }

  @Get('/busy')
  async getBusy(
    @Query('requestId') requestId: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ): Promise<IServerResponse<{transport: number[], drivers: number[]}>> {
    return await this.requestsService.getBusy(
      parseInt(requestId, null),
      parseInt(startTime, null),
      parseInt(endTime, null),
    );
  }
}
