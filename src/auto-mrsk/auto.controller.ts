import { Controller, Get, Query, Req } from '@nestjs/common';
import * as moment from 'moment';

import { IServerResponse } from '@kolenergo/core';
import { IInitialData } from '@kolenergo/auto';
import { AutoService } from './auto.service';

@Controller('auto-mrsk')
export class AutoController {
  constructor(private readonly autoService: AutoService) {}

  @Get('/')
  async getInitialData(@Req() request): Promise<IServerResponse<IInitialData>> {
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');
    const startOfCalendar = moment(startOfMonth).startOf('week');
    const endOfCalendar = moment(endOfMonth).endOf('week');
    const user = request.user ? request.user.data : null;
    const result = await this.autoService.getInitialData(
      moment().format('DD.MM.YYYY'),
      user ? user.id : 0,
      startOfCalendar.unix() * 1000,
      endOfCalendar.unix() * 1000,
    );
    result.data.date = moment().toDate();
    result.data.user = user;
    return result;
  }
}
