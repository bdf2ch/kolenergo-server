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
    const user = request.user ? request.user.data : null;
    const result = await this.autoService.getInitialData(
      moment().format('DD.MM.YYYY'),
      user ? user.id : 0,
    );
    result.data.date = moment().toDate();
    result.data.user = user;
    return result;
  }
}
