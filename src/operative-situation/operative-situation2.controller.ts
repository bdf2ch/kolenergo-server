import {Controller, Post, Get, Body, Param, Query, Delete, Patch, Req, Res} from '@nestjs/common';
import { IServerResponse } from '@kolenergo/cpa';
import { OperativeSituationService2 } from './operative-situation2.service';
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

@Controller('osr2')
export class OperativeSituationController2 {
  constructor(private readonly operativeSituationService: OperativeSituationService2) {}

  /*
  @Get()
  async getReportsByDate(@Query('companyId') companyId: number): Promise<IServerResponse<IAppInitData>> {
    const result = await this.operativeSituationService.getReportsByDate(companyId, moment().format('DD.MM.YYYY'));
    return result;
  }
   */

  @Get('/all')
  async getAllReports(): Promise<IReport[]> {
    const result = await this.operativeSituationService.getAllReports();
    return result;
  }

  @Get('/')
  async getInitialData(@Query('companyId') companyId: number, @Req() request): Promise<IServerResponse<IAppInitData>> {
    const user = request.user ? request.user.data : null;
    console.log('user', request.user);
    const result = await this.operativeSituationService.getInitialData(user ? user.company.id === 8 ? 2 : user.company.id : 2);
    result.data.date = moment().format('DD.MM.YYYY');
    result.data.time = moment().format('HH:mm');
    result.data.user = user;
    return result;
  }

  @Get('/export')
  async exportReport() {}

  @Post()
  async addReport(@Body() report: Report): Promise<IServerResponse<IReportSummary>> {
    const result = await this.operativeSituationService.addReport(report);
    return result;
  }

  @Get('/reports')
  async getReports(
    @Query('companyId') companyId: string,
    @Query('divisionId') divisionId: string,
  ): Promise<IServerResponse<IReportSummary>> {
    const result =  parseInt(companyId, null) !== 0
      ? await this.operativeSituationService.getReportsByCompany(parseInt(companyId, null))
      : await this.operativeSituationService.getReportsByDivision(parseInt(divisionId, null));
    result.data.date = moment().format('DD.MM.YYYY');
    return result;
  }

  @Post('/consumption')
  async addConsumption(
    @Body() consumption: {
      companyId: number,
      divisionId: number,
      consumption: number,
    },
    @Req() request,
  ): Promise<IServerResponse<number>> {
    const result = await this.operativeSituationService.addConsumption(
      consumption.companyId,
      consumption.divisionId,
      request.user ? request.user.data.id : 0,
      consumption.consumption,
    );
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
  async editReport(@Body() report: Report): Promise<IServerResponse<IReportSummary>> {
    return await this.operativeSituationService.editReport(report);
  }

  @Patch('/consumption')
  async editConsumption(@Body() consumption: OperativeSituationConsumption): Promise<IServerResponse<IOperativeSituationConsumption>> {
    const result = await this.operativeSituationService.editConsumption(consumption);
    return result;
  }

  @Delete('/:id')
  async deleteReport(@Param('id') reportId: number): Promise<IServerResponse<boolean>> {
    const result = await this.operativeSituationService.deleteReport(reportId);
    return result;
  }
}
