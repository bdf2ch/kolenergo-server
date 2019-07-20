import { Controller, Post, Get, Body, Param, Query, Delete, Patch} from '@nestjs/common';
import { IServerResponse } from '@kolenergo/core';
import { IEventShedulerInitialData, IEventRequest, ECalendarModes } from '@kolenergo/esa';
import { EventShedulerService } from './event-sheduler.service';
import * as moment from 'moment';

@Controller('esa')
export class EventShedulerController {
  constructor(private readonly eventShedulerService: EventShedulerService) {}

  @Get('')
  async getInitialData(
    @Query('userId') userId: number, @Query('mode') mode: string): Promise<IServerResponse<IEventShedulerInitialData>> {
      let start = null;
      let end = null;

      switch (mode) {
        case ECalendarModes.DAY_MODE:
          start = moment().startOf('day').unix();
          end = moment().endOf('day').unix();
          break;
        case ECalendarModes.WEEK_MODE:
          start = moment().startOf('day').unix();
          end = moment().startOf('day').add(6, 'day').endOf('day').unix();
          break;
        case ECalendarModes.MONTH_MODE:
          break;
      }

      const result = await this.eventShedulerService.getInitialData(userId, start, end);
      return result;
  }

  @Post('/request')
  async addRequest(@Body('request') request: IEventRequest): Promise<IServerResponse<IEventRequest>> {
    const result = await this.eventShedulerService.addRequest(request);
    return  result;
  }
}
