import { Controller, Post, Get, Body, Param, Query, Delete, Patch } from '@nestjs/common';
import { OperativeSituationService } from './operative-situation.service';
import { IServerResponse } from '@kolenergo/core';
import {
    IOperativeSituationConsumption,
    IOperativeSituationRegion,
    IOperativeSituationReport,
    IOperativeSituationReportsInitialData,
    IOperativeSituationWeatherReport, IWeatherSummary,
    OperativeSituationConsumption,
    OperativeSituationReport,
} from '@kolenergo/osr';
import * as moment from 'moment';

@Controller('osr')
export class OperativeSituationController {
    constructor(private readonly operativeSituationService: OperativeSituationService) {}

    @Get()
    async getReportsByDate(@Query('companyId') companyId: number): Promise<IServerResponse<IOperativeSituationReportsInitialData>> {
        const result = await this.operativeSituationService.getReportsByDate(companyId, moment().format('DD.MM.YYYY'));
        return result;
    }

    @Get('/all')
    async getAllReports(): Promise<IOperativeSituationReport[]> {
        const result = await this.operativeSituationService.getAllReports();
        return result;
    }

    @Get('/init')
    async getInitialData(@Query('companyId') companyId: number): Promise<IServerResponse<IOperativeSituationReportsInitialData>> {
        const result = await this.operativeSituationService.getInitialData(companyId);
        result.data.date = moment().format('DD.MM.YYYY');
        result.data.time = moment().format('HH:mm');
        return result;
    }

    @Get('/export')
    async exportReport() {}

    @Post()
    async addReport(@Body() report: OperativeSituationReport): Promise<IServerResponse<IOperativeSituationReport>> {
        const result = await this.operativeSituationService.addReport(report);
        return result;
    }

    @Post('/consumption')
    async addConsumption(@Body() consumption: OperativeSituationConsumption): Promise<IServerResponse<IOperativeSituationConsumption>> {
        const result = await this.operativeSituationService.addConsumption(consumption);
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

    @Patch('')
    async editReport(@Body() report: OperativeSituationReport): Promise<IServerResponse<IOperativeSituationReport>> {
        const result = await this.operativeSituationService.editReport(report);
        return result;
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
