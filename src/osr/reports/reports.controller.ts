import {Controller, Post, Get, Body, Param, Query, Delete, Patch, Req, Res} from '@nestjs/common';
import { IServerResponse } from '@kolenergo/cpa';
import {
  IOperativeSituationConsumption,
  IOperativeSituationRegion,
  IOperativeSituationReport,
  IOperativeSituationReportsInitialData,
  IOperativeSituationWeatherReport,
  OperativeSituationConsumption,
  OperativeSituationReport,
} from '@kolenergo/osr';
import { IAppInitData, IReport, IConsumption, IReportSummary, IWeatherSummary, Consumption, Report } from '@kolenergo/osr2';
import * as moment from 'moment';
import { ReportsService } from './reports.service';

@Controller('osr2/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('/all')
  async getAllReports(): Promise<IReport[]> {
    const result = await this.reportsService.getAllReports();
    return result;
  }

  @Get('/export')
  async exportReport() {}

  @Post()
  async add(@Body() report: Report): Promise<IServerResponse<IReportSummary>> {
    return  await this.reportsService.add(report);
  }

  @Get('/')
  async get(
    @Query('companyId') companyId: string,
    @Query('divisionId') divisionId: string,
    @Query('time') time?: string,
  ): Promise<IServerResponse<IReportSummary>> {
    const result =  parseInt(companyId, null) !== 0
      ? await this.reportsService.getByCompany(parseInt(companyId, null))
      : await this.reportsService.getByDivision(parseInt(divisionId, null));
    result.data.date = moment().format('DD.MM.YYYY');
    return result;
  }


  @Post('/weather')
  async addWeather(@Body() weather: IOperativeSituationWeatherReport): Promise<IServerResponse<IOperativeSituationWeatherReport>> {
    const result = this.operativeSituationService.addWeather();
    return result;
  }

  @Get('/weatherSummary')
  async getWeatherSummary(@Query('companyId') companyId: number): Promise<IServerResponse<IWeatherSummary>> {
    if (companyId) {
      const result = await this.operativeSituationService.getWeatherSummaryByCompanyId(companyId);
      return result;
    }
    return null;
  }

  @Post('/weatherSummary')
  async addWeatherSummary(@Body() weather: IWeatherSummary): Promise<IServerResponse<IWeatherSummary[]>> {
    const result = this.operativeSituationService.addWeatherSummary();
    return result;
  }

  @Patch('/:id')
  async edit(@Body() report: Report): Promise<IServerResponse<IReportSummary>> {
    return await this.reportsService.edit(report);
  }

  @Delete('/:id')
  async delete(@Param('id') reportId: number): Promise<IServerResponse<boolean>> {
    const result = await this.operativeSituationService.deleteReport(reportId);
    return result;
  }
}
