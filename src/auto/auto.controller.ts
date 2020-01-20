import { Controller, Get, Query } from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { IAutoRequestsInitialData } from '@kolenergo/auto';
import { AutoService } from './auto.service';

@Controller('auto')
export class AutoController {
  constructor(private readonly autoService: AutoService) {}

  @Get('/')
  async getInitialData(
    @Query('startTime') startTime: number,
    @Query('endTime') endTime: number,
    @Query('departmentId') departmentId: number,
    @Query('userId') userId: number,
  ): Promise<IServerResponse<IAutoRequestsInitialData>> {
    return await this.autoService.getInitialData(
      startTime,
      endTime,
      departmentId,
      userId,
    );
  }
}
