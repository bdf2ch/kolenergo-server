import { Controller, Post, Get, Body, Query, Delete, Patch } from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { IApplicationInitialData, IPressReport, PressReport } from '@kolenergo/press';
import { PressReportsService } from './press-reports.service';

@Controller('press')
export class PressReportsController {
  constructor(private readonly pressReports: PressReportsService) {}

  @Get('/')
  async getInitialData(): Promise<IServerResponse<IApplicationInitialData>> {
    const result = await this.pressReports.getInitialData();
    return result;
  }

  @Get('/reports')
  async getReportsByDate(@Query('date') date: string): Promise<IServerResponse<IPressReport[]>> {
    const result = await this.pressReports.getReportsByDate(date);
    return result;
  }

  @Post('/reports')
  async addReports(@Body() reports: PressReport[]): Promise<IServerResponse<IPressReport[]>> {
    const result = await this.pressReports.addReports(reports);
    return result;
  }

  @Patch('/reports')
  async editReports(@Body() reports: PressReport[]): Promise<IServerResponse<IPressReport[]>> {
    const result = await this.pressReports.editReports(reports);
    return result;
  }

  @Delete('/reports')
  async removeReportsByDate(@Query('date') date: string): Promise<IServerResponse<boolean>> {
    const result = await this.pressReports.deleteReportsByDate(date);
    return result;
  }
}
