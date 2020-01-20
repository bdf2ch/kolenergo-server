import { Controller, Post, Get, Body, Param, Query, Delete, Patch} from '@nestjs/common';
import { AhoRequestsService } from './aho-requests__.service';
import {
  IAhoRequestType,
  IAhoRequest,
  IAddAhoRequest,
  IAhoRequestStatus,
  IAhoRequestTaskContent,
  IAhoRequestComment,
  IAhoRequestNeed, AhoRequestRejectReason, AhoRequest, IAhoRequestsInitialData,
} from '@kolenergo/aho';
import { IServerResponse, IUser } from '@kolenergo/cpa';
import { IAhoRequestsInitialData2 } from '@kolenergo/aho2';
import { AhoRequestsServiceNew } from './aho-requests.service';

@Controller('aho2')
export class AhoRequestsControllerNew {
  constructor(private readonly ahoRequestsService: AhoRequestsServiceNew) {}

  @Get('')
  async getInitialData(@Query('userId') userId, @Query('itemsOnPage') itemsOnPage): Promise<IServerResponse<IAhoRequestsInitialData2>> {
    const result = await this.ahoRequestsService.getInitialData(userId, itemsOnPage);
    return result;
  }

  @Get('/requests')
  async getRequests(
    @Query('departmentId') departmentId,
    @Query('start') start,
    @Query('end') end,
    @Query('userId') userId,
    @Query('employeeId') employeeId,
    @Query('requestTypeId') requestTypeId,
    @Query('requestStatusId') requestStatusId,
    @Query('onlyExpired') onlyExpired,
    @Query('page') page,
    @Query('itemsOnPage') itemsOnPage,
    @Query('search') search,
  ): Promise<IServerResponse<IAhoRequest[]>> {
    if (search && search !== null) {
      const result = await this.ahoRequestsService.searchRequests(userId, search);
      return result;
    } else {
      const result =
        await this.ahoRequestsService.getRequests(
          departmentId,
          start,
          end,
          userId,
          employeeId,
          requestTypeId,
          requestStatusId,
          onlyExpired,
          page,
          itemsOnPage,
        );
      return result;
    }
  }
}
