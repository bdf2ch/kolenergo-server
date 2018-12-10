import { Controller, Post, Get, Body, Param, Query, Delete, Patch } from '@nestjs/common';
import * as moment from 'moment';
import { OperativeSituationService } from './operative-situation.service';
import { IServerResponse } from '@kolenergo/lib';
import { IOperativeSituationReport, IOperativeSituationReportsInitialData, OperativeSituationReport } from '@kolenergo/osr';

@Controller('osr')
export class OperativeSituationController {
    constructor(private readonly operativeSituationService: OperativeSituationService) {}

    @Get('')
    async getReportsByDate(@Query('companyId') companyId: number): Promise<IServerResponse<IOperativeSituationReport[]>> {
        const date = moment();
        console.log(date.format('DD.MM.YYYY'));
        const result = await this.operativeSituationService.getReportsByDate(companyId, date.format('DD.MM.YYYY'));
        return result;
    }

    @Get('/init')
    async getInitialData(@Query('companyId') companyId: number): Promise<IServerResponse<IOperativeSituationReportsInitialData>> {
        const result = await this.operativeSituationService.getInitialData(companyId);
        result.data.date = moment().format('DD.MM.YYYY');
        return result;
    }

    @Post('')
    async addReport(@Body() report: OperativeSituationReport): Promise<IServerResponse<IOperativeSituationReport>> {
        const result = await this.operativeSituationService.addReport(report);
        return result;
    }

    @Patch('')
    async editReport(@Body() report: OperativeSituationReport): Promise<IServerResponse<IOperativeSituationReport>> {
        const result = await this.operativeSituationService.editReport(report);
        return result;
    }
}