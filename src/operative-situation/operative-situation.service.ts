import { Component } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { ICompany, IServerResponse } from '@kolenergo/lib';
import {IOperativeSituationReport, OperativeSituationReport} from '@kolenergo/osr';
import moment = require('moment');

@Component()
export class OperativeSituationService {
  constructor(private readonly postgresService: PostgresService) {}

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

    /**
     * Получение отчетов об оперративной обстановке по дате
     */
    async getCompanies(): Promise<ICompany[]> {
        const result = await this.postgresService.query(
            'get-companies',
            `SELECT * FROM companies`,
            [],
            '',
        );
        return result;
    }

    async addReport(report: OperativeSituationReport): Promise<IServerResponse<IOperativeSituationReport>> {
      console.log(report);
      const date = moment();
      const result = await this.postgresService.query(
          'add-operative-situation-report',
          'SELECT operative_situation_reports_add($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)',
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
              Number(report.equipment_35_150.effect.power),
              Number(report.equipment_35_150.effect.szo),
              Number(report.equipment_network.lep_6_20),
              Number(report.equipment_network.tp_6_20),
              Number(report.equipment_network.effect.population),
              Number(report.equipment_network.effect.power),
              Number(report.equipment_network.effect.szo),
          ],
          'operative_situation_reports_add',
      );
      return result ? result : null;
    }
}