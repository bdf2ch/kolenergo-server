import { Controller, Post, Get, Body, Query } from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { IOperativeSituationWeatherReport } from '@kolenergo/osr';
import { IWeatherSummary } from '@kolenergo/osr2';
import { WeatherService } from './weather.service';

@Controller('osr2/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('/')
  async addWeather(
    @Body() weather: IOperativeSituationWeatherReport,
  ): Promise<IServerResponse<IOperativeSituationWeatherReport>> {
    return  this.weatherService.addWeather();
  }

  @Get('/summary')
  async getWeatherSummary(@Query('companyId') companyId: number): Promise<IServerResponse<IWeatherSummary>> {
    return companyId ? await this.weatherService.getWeatherSummaryByCompanyId(companyId) : null;
  }

  @Post('/summary')
  async addWeatherSummary(@Body() weather: IWeatherSummary): Promise<IServerResponse<IWeatherSummary[]>> {
    return this.weatherService.addWeatherSummary();
  }
}
