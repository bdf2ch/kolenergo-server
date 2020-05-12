import { Controller, Post, Body, Req } from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { ConsumptionService } from './consumption.service';

@Controller('osr2/consumption')
export class ConsumptionController {
  constructor(private readonly consumptionService: ConsumptionService) {}

  @Post('/')
  async add(
    @Req() request,
    @Body() body: {
      companyId: number,
      divisionId: number,
      consumption: number,
    },
  ): Promise<IServerResponse<number>> {
    const result = await this.consumptionService.add(
      body.companyId,
      body.divisionId,
      request.user ? request.user.data.id : 0,
      body.consumption,
    );
    return result;
  }
}
