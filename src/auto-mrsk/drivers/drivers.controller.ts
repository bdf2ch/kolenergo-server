import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { IDriver, Driver } from '@kolenergo/auto';
import { DriversService } from './drivers.service';

@Controller('auto-mrsk/drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get('/')
  async searchDriver(@Query('query') query: string): Promise<IServerResponse<IDriver[]>> {
    return await this.driversService.searchDriver(query);
  }

  @Post('/')
  async addDriver(@Body() driver: Driver): Promise<IServerResponse<IDriver>> {
    return await this.driversService.addDriver(driver);
  }

  @Patch('/:id')
  async editDriver(@Body() driver: Driver): Promise<IServerResponse<IDriver>> {
    return await this.driversService.editDriver(driver);
  }

  @Delete('/:id')
  async removeDriver(driver: Driver): Promise<IServerResponse<boolean>> {
    return await this.driversService.removeDriver(driver);
  }
}
