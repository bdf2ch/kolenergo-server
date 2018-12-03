import { Controller, Post, Get, Body, Param, Query, Delete, Patch } from '@nestjs/common';
import * as moment from 'moment';
import { OperativeSituationService } from './operative-situation.service';
import { ICompany, IServerResponse } from '@kolenergo/lib';
import { IOperativeSituationReport, OperativeSituationReport } from '@kolenergo/osr';

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

    @Get('/companies')
    async getCompanies(): Promise<ICompany[]> {
        const result = await this.operativeSituationService.getCompanies();
        return result;
    }

    @Post('')
    async addReport(@Body() report: OperativeSituationReport): Promise<IServerResponse<IOperativeSituationReport>> {
        const result = await this.operativeSituationService.addReport(report);
        return result;
    }
}