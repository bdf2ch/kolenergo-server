import { Controller, Get, Query, Req } from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { IApplicationInitialData } from '@kolenergo/messenger';
import { MessengerService } from './messenger.service';

@Controller('messenger')
export class MessengerController {
  constructor(private readonly osr: MessengerService) {}

  @Get('/')
  async getInitialData(
    @Req() request,
    @Query('userId') userId: number,
    @Query('messageCount') messageCount: number,
  ): Promise<IServerResponse<IApplicationInitialData>> {
    const user = request.user ? request.user.data : null;
    const result = await this.osr.getInitialData(7, messageCount);
    // result.data.user = user;
    return result;
  }
}
