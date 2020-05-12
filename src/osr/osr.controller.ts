import { Controller, Get, Query, Req } from '@nestjs/common';
import * as moment from 'moment';

import { IServerResponse } from '@kolenergo/core';
import { IAppInitData } from '@kolenergo/osr2';
import { OSRService } from './osr.service';

@Controller('osr2')
export class OSRController {
  constructor(private readonly osr: OSRService) {}

  @Get('/')
  async getInitialData(
    @Req() request,
    @Query('companyId') companyId: number,
  ): Promise<IServerResponse<IAppInitData>> {
    const user = request.user ? request.user.data : null;
    const result = await this.osr.getInitialData(user ? user.company.id === 8 ? 2 : user.company.id : 2);
    result.data.date = moment().format('DD.MM.YYYY');
    result.data.user = user;
    return result;
  }
}
