import { Component } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { IServerResponse } from '@kolenergo/lib';
import { IOperativeSituationReport, IOperativeSituationReportsInitialData, OperativeSituationReport } from '@kolenergo/osr';
import moment = require('moment');

@Component()
export class OperativeSituationService {
  constructor(private readonly postgresService: PostgresService) {}

    async getInitialData(companyId: number): Promise<IServerResponse<IOperativeSituationReportsInitialData>> {
        const date = moment();
        const result = await this.postgresService.query(
            'operative-situation-reports-get-initial-data',
            'SELECT operative_situation_reports_get_initial_data($1, $2)',
            [
                companyId,
                date.format('DD.MM.YYYY'),
            ],
            'operative_situation_reports_get_initial_data',
        );
        return result ? result : null;
    }

    /**
     * Получение отчетов об оперративной обстановке по дате
     */
    async getReportsByDate(companyId: number, date: string): Promise<IServerResponse<IOperativeSituationReport[]>> {
        const result = await this.postgresService.query(
            'operative-situation-reports-get-by-date',
            `SELECT operative_situation_reports_get_by_date($1, $2)`,
            [companyId, date],
            'operative_situation_reports_get_by_date',
        );
        return result;
    }

    async addReport(report: OperativeSituationReport): Promise<IServerResponse<IOperativeSituationReport>> {
        const date = moment();
        const result = await this.postgresService.query(
            'add-operative-situation-report',
            `SELECT operative_situation_reports_add(
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                  $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
                  $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38
                )`,
            [
                report.company.id,
                report.user.id,
                date.format('DD.MM.YYYY'),
                report.periodTime,
                Number(report.equipment_35_150.lep_110_150),
                Number(report.equipment_35_150.lep_35),
                Number(report.equipment_35_150.ps_110_150),
                Number(report.equipment_35_150.ps_35),
                Number(report.equipment_35_150.effect.tp_6_20),
                Number(report.equipment_35_150.effect.population),
                report.equipment_35_150.effect.power,
                Number(report.equipment_35_150.effect.szo),
                Number(report.equipment_network.lep_6_20),
                Number(report.equipment_network.tp_6_20),
                Number(report.equipment_network.effect.population),
                report.equipment_network.effect.power,
                Number(report.equipment_network.effect.szo),
                Number(report.weather.min),
                Number(report.weather.max),
                report.weather.wind,
                report.weather.precipitations,
                report.weather.rpg,
                report.weather.orr,
                Number(report.resources.brigades),
                Number(report.resources.people),
                Number(report.resources.technics),
                report.violations.total_6,
                report.violations.uapv_35,
                report.violations.napv_35,
                report.violations.power_off_35,
                report.violations.lep_rs,
                report.violations.tn_cancel,
                report.violations.from_6_04,
                report.violations.power_off_04,
                report.violations.greater_3_04,
                report.violations.population_srez_04,
                report.violations.population_greater_3_04,
                report.consumption,

            ],
            'operative_situation_reports_add',
        );
        return result ? result : null;
    }

    async editReport(report: OperativeSituationReport): Promise<IServerResponse<IOperativeSituationReport>> {
        const result = await this.postgresService.query(
            'edit-operative-situation-report',
            `SELECT operative_situation_reports_edit(
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                  $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
                  $27, $28, $29, $30, $31, $32, $33, $34, $35
                )`,
            [
                report.id,
                report.equipment_35_150.lep_110_150,
                report.equipment_35_150.lep_35,
                report.equipment_35_150.ps_110_150,
                report.equipment_35_150.ps_35,
                report.equipment_35_150.effect.tp_6_20,
                report.equipment_35_150.effect.population,
                report.equipment_35_150.effect.power,
                report.equipment_35_150.effect.szo,
                report.equipment_network.lep_6_20,
                report.equipment_network.tp_6_20,
                report.equipment_network.effect.population,
                report.equipment_network.effect.power,
                report.equipment_network.effect.szo,
                report.weather.min,
                report.weather.max,
                report.weather.wind,
                report.weather.precipitations,
                report.weather.rpg,
                report.weather.orr,
                report.resources.brigades,
                report.resources.people,
                report.resources.technics,
                report.violations.total_6,
                report.violations.uapv_35,
                report.violations.napv_35,
                report.violations.power_off_35,
                report.violations.lep_rs,
                report.violations.tn_cancel,
                report.violations.from_6_04,
                report.violations.power_off_04,
                report.violations.population_greater_3_04,
                report.violations.population_srez_04,
                report.violations.population_greater_3_04,
                report.consumption,
            ],
            'operative_situation_reports_edit',
        );
        return result ? result : null;
    }
}