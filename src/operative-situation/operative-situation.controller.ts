import { Controller, Post, Get, Body, Param, Query, Delete, Patch } from '@nestjs/common';
import * as moment from 'moment';
import { OperativeSituationService } from './operative-situation.service';
import { IServerResponse } from '@kolenergo/lib';
import {
    IOperativeSituationConsumption,
    IOperativeSituationReport,
    IOperativeSituationReportsInitialData,
    OperativeSituationConsumption,
    OperativeSituationReport,
} from '@kolenergo/osr';

@Controller('osr')
export class OperativeSituationController {
    constructor(private readonly operativeSituationService: OperativeSituationService) {}

    @Get('')
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

    @Post('')
    async addReport(@Body() report: OperativeSituationReport): Promise<IServerResponse<IOperativeSituationReport>> {
        const result = await this.operativeSituationService.addReport(report);
        return result;
    }

    @Post('/consumption')
    async addConsumption(@Body() consumption: OperativeSituationConsumption): Promise<IServerResponse<IOperativeSituationConsumption>> {
        const result = await this.operativeSituationService.addConsumption(consumption);
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
}