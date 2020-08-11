import { Controller, Get, Query, Req } from '@nestjs/common';
import * as moment from 'moment';

import { IServerResponse } from '@kolenergo/core';
import { IInitialData } from '@kolenergo/auto';
import { AutoService } from './auto.service';

@Controller('auto-mrsk')
export class AutoController {
  constructor(private readonly autoService: AutoService) {}

  @Get('/')
  async getInitialData(
    @Query('startTime') startTime: number,
    @Query('endTime') endTime: number,
    @Req() request,
  ): Promise<IServerResponse<IInitialData>> {
    const date = moment();
    const user = request.user ? request.user.data : null;
    const result = await this.autoService.getInitialData(date.startOf('day').unix(), date.endOf('day').unix());
    result.data.date = date.toDate();
    result.data.user = user;
    return result;
  }
}
