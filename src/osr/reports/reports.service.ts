import { Component } from '@nestjs/common';

import { PostgresService } from '../../common/database/postgres.service';
import { ICompany, IServerResponse } from '@kolenergo/cpa';
import {
  IOperativeSituationReport,
  IOperativeSituationWeatherReport,
  IOperativeSituationReportsInitialData,
  OperativeSituationReport,
  OperativeSituationConsumption,
  IOperativeSituationConsumption, IOperativeSituationRegion, ILocation, IWeatherSummaryResponse } from '@kolenergo/osr';
import { IAppInitData, IReport, IPeriod, IConsumption, IWeatherSummary, IReportSummary, Report, Consumption } from '@kolenergo/osr2';
import moment = require('moment');
import * as path from 'path';
import * as excel from 'excel4node';
import rpn = require('request-promise-native');

@Component()
export class ReportsService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Получение всех отчетов об оперативной обстановке
   */
  async getAllReports(): Promise<IOperativeSituationReport[]> {
    return await this.postgresService.query(
      'operative-situation-reports-get-all',
      `SELECT * FROM operative_situation_reports`,
      [],
      '',
    );
  }

  /**
   * Получение отчетов об оперативной обстановке по дате
   */
  async getReportsByDate(companyId: number, date: string): Promise<IServerResponse<IOperativeSituationReportsInitialData>> {
    return await this.postgresService.query(
      'operative-situation-reports-get-by-date',
      `SELECT operative_situation_reports_get_by_date($1, $2)`,
      [companyId, date],
      'operative_situation_reports_get_by_date',
    );
  }

  /**
   * Получение отчетов об оперативной обстановке по дате и периоду
   */
  async getReportsByDateAndPeriod(date: string, period: string): Promise<IServerResponse<IOperativeSituationReport[]>> {
    return await this.postgresService.query(
      'osr-get-report-by-date-and-period',
      `SELECT operative_situation_reports_get_by_date_and_period($1, $2)`,
      [date, period],
      'operative_situation_reports_get_by_date_and_period',
    );
  }

  /**
   * Получение сводки отчетов за указаннйю дату по организации
   * @param companyId - Идентификатор организации
   */
  async getByCompany(
    companyId: number,
    time?: string,
  ): Promise<IServerResponse<IReportSummary>> {
    const date = moment();
    return await this.postgresService.query(
      'osr-get-report-by-company',
      'SELECT osr.reports_get_by_company($1, $2, $3)',
      [companyId, date.format('DD.MM.YYYY'), time],
      'reports_get_by_company',
    );
  }

  /**
   * Получение сводки отчетов по оперативной обстановке за указанную дату по структурному подразделению
   * @param divisionId - Идентификатор структурного подразделения
   */
  async getByDivision(divisionId: number): Promise<IServerResponse<IReportSummary>> {
    const date = moment();
    return await this.postgresService.query(
      'osr-get-report-by-division',
      `SELECT osr.reports_get_by_division($1, $2)`,
      [divisionId, date.format('DD.MM.YYYY')],
      'reports_get_by_division',
    );
  }

  /**
   * Получение последней погодной сводки по идентификатору организации
   */
  async getWeatherSummaryByCompanyId(companyId: number): Promise<IServerResponse<IWeatherSummary>> {
    return await this.postgresService.query(
      'operative-situation-reports-get-weather-summary-by-company',
      `SELECT operative_situation_reports_weather_summary_get_by_company_id($1)`,
      [companyId],
      'operative_situation_reports_weather_summary_get_by_company_id',
    );
  }

  /**
   * Добавление отчета обоперативной обстановке
   * @param report - Добавляемый отчет об оперативной обстановке
   */
  async add(report: Report): Promise<IServerResponse<IReportSummary>> {
    const date = moment();
    let periodTime = '';
    const periods = await this.postgresService.query(
      'osr-get-periods',
      'SELECT * FROM osr.periods',
      [],
      '',
    );

    periods.forEach((period: IPeriod, index: number, array: IPeriod[]) => {
      const periodStart = moment(`${date.format('DD.MM.YYYY')} ${period.start}`, 'DD.MM.YYYY HH:mm');
      const periodEnd = moment(`${date.format('DD.MM.YYYY')} ${period.end}`, 'DD.MM.YYYY HH:mm');
      const periodStartMin = moment(periodStart).subtract(10, 'minutes');
      const periodStartMax = moment(periodStart).add(10, 'minutes');
      const periodEndMin = moment(periodEnd).subtract(10, 'minutes');
      const periodEndMax = moment(periodEnd).add(10, 'minutes');

      if (date.isBetween(periodStartMin, periodStartMax)) {
        periodTime = period.start;
      } else if (date.isBetween(periodEndMin, periodEndMax)) {
        periodTime = period.end;
      } else if (date.isBetween(periodStartMax, periodEndMin)) {
        periodTime = date.minutes() <= 30 ? `${date.format('HH')}:00` : `${date.format('HH')}:30`;
      }
    });

    const period = this.getPeriodByTime(periods);
    return await this.postgresService.query(
      'osr-add-report',
      `SELECT osr.reports_add(
                  $1,  $2,  $3,  $4,  $5,  $6,  $7,  $8,  $9,  $10, $11, $12,
                  $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
                  $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36,
                  $37, $38
                )`,
      [
        report.companyId,
        report.divisionId,
        period.id,
        report.user.id,
        date.format('DD.MM.YYYY'),
        periodTime,
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
        report.violations.greater_3_04,
        report.violations.population_srez_04,
        report.violations.population_greater_3_04,
        report.resources.rise,
        report.resources.riseSumPower,
        report.resources.risePeople,
        report.weather.orr,
        report.weather.rpg,
      ],
      'reports_add',
    );
  }

  /**
   * Изменение отчета об оперативной обстановке
   * @param report - Изменяемый отчет об оперативной обстановке
   */
  async edit(report: Report): Promise<IServerResponse<IReportSummary>> {
    return await this.postgresService.query(
      'osr-edit-report',
      `SELECT osr.reports_edit(
                  $1,  $2,  $3,  $4,  $5,  $6,  $7,  $8,  $9,  $10, $11,
                  $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
                  $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33
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
        report.violations.greater_3_04,
        report.violations.population_srez_04,
        report.violations.population_greater_3_04,
        report.resources.rise,
        report.resources.riseSumPower,
        report.resources.risePeople,
      ],
      'reports_edit',
    );
  }

  /**
   * Удаление отчета об оперативной обстановке
   * @param reportId - Идентификатор отчета
   */
  async deleteReport(reportId: number): Promise<IServerResponse<boolean>> {
    return await this.postgresService.query(
      'delete-operative-situation-report',
      `SELECT operative_situation_reports_delete($1)`,
      [
        reportId,
      ],
      'operative_situation_reports_delete',
    );
  }

  async exportReport(date: string, period: string): Promise<string> {
    const wb = new excel.Workbook();
    const sheet = wb.addWorksheet('Оперативная обстановка', {
      pageSetup: {
        orientation: 'landscape',
        scale: 55,
      },
    });
    let row = 1;
    const border = {
      style: 'thin',
      color: 'black',
    };
    const contentStyle = wb.createStyle({
      border: {
        left: border,
        top: border,
        right: border,
        bottom: border,
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true,
      },
      font: {
        size: 10,
      },
    });
    const summaryStyle = wb.createStyle({
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: 'e0f2f1',
      },
      font: {
        bold: true,
        size: 9,
      },
    });
    const regularStyle = wb.createStyle({
      font: {
        bold: false,
        size: 10,
      },
    });
    const headerStyle = wb.createStyle({
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: 'f5f5f5',
      },
      border: {
        left: border,
        top: border,
        right: border,
        bottom: border,
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true,
      },
      font: {
        size: 8,
      },
    });
    const titleStyle = wb.createStyle({
      alignment: {
        horizontal: 'left',
        vertical: 'center',
      },
      font: {
        size: 18,
      },
    });

    sheet.column(1).setWidth(3);
    sheet.column(2).setWidth(20);
    sheet.column(3).setWidth(7);
    sheet.column(4).setWidth(7);
    sheet.column(5).setWidth(7);
    sheet.column(7).setWidth(7);
    sheet.column(6).setWidth(7);
    sheet.column(8).setWidth(7);
    sheet.column(9).setWidth(7);
    sheet.column(10).setWidth(7);
    sheet.column(11).setWidth(7);
    sheet.column(12).setWidth(7);
    sheet.column(13).setWidth(7);
    sheet.column(14).setWidth(7);
    sheet.column(15).setWidth(7);
    sheet.column(16).setWidth(7);
    sheet.column(17).setWidth(7);
    sheet.column(18).setWidth(7);
    sheet.column(19).setWidth(7);
    sheet.column(20).setWidth(7);
    sheet.column(21).setWidth(7);
    sheet.column(22).setWidth(7);
    sheet.column(23).setWidth(7);
    sheet.column(24).setWidth(7);
    sheet.column(25).setWidth(7);
    sheet.column(26).setWidth(7);
    sheet.column(27).setWidth(7);
    sheet.column(28).setWidth(7);

    row++;
    sheet.row(row).setHeight(30);
    sheet.cell(row, 2).string(`Оперативная обстановка по состоянию на ${period} ${date}`).style(titleStyle);

    row++;
    sheet.row(row).setHeight(45);
    sheet.cell(row, 2, row + 1, 2, true).string('Филиал').style(headerStyle);
    sheet.cell(row, 3, row, 6, true).string('Отключенное оборудование по сети 35-150 кВ').style(headerStyle);
    sheet.cell(row, 7, row, 10, true).string('Последствия для потребителей по сети 35-150 кВ').style(headerStyle);
    sheet.cell(row, 11, row, 12, true).string('Распределительная сеть').style(headerStyle);
    sheet.cell(row, 13, row, 15, true).string('Последствия для потребителей по распределительной сети').style(headerStyle);
    sheet.cell(row, 16, row, 19, true).string('Последствия для потребителей суммарно по основной и распределительной сети').style(headerStyle);
    sheet.cell(row, 20, row, 22, true).string('Задействованные РИСЭ').style(headerStyle);
    sheet.cell(row, 23, row, 25, true).string('Задействованные силы и средства').style(headerStyle);

    row++;
    sheet.row(row).setHeight(45);
    sheet.cell(row, 3).string('ЛЭП 110-150 кВ, шт.').style(headerStyle);
    sheet.cell(row, 4).string('ЛЭП 35 кВ, шт.').style(headerStyle);
    sheet.cell(row, 5).string('ПС 110 - 150 кВ, шт.').style(headerStyle);
    sheet.cell(row, 6).string('ПС 35 кВ, шт.').style(headerStyle);
    sheet.cell(row, 7).string('ТП 6-20 кВ, шт.').style(headerStyle);
    sheet.cell(row, 8).string('Население, чел').style(headerStyle);
    sheet.cell(row, 9).string('Нагрузка, МВт').style(headerStyle);
    sheet.cell(row, 10).string('СЗО, шт').style(headerStyle);
    sheet.cell(row, 11).string('ЛЭП 6-20 кВ, шт.').style(headerStyle);
    sheet.cell(row, 12).string('ТП 6-20 кВ, шт.').style(headerStyle);
    sheet.cell(row, 13).string('Население, чел').style(headerStyle);
    sheet.cell(row, 14).string('Нагрузка, МВт').style(headerStyle);
    sheet.cell(row, 15).string('СЗО, шт').style(headerStyle);
    sheet.cell(row, 16).string('ТП 6-20 кВ, шт.').style(headerStyle);
    sheet.cell(row, 17).string('Население, чел').style(headerStyle);
    sheet.cell(row, 18).string('Нагрузка, МВт').style(headerStyle);
    sheet.cell(row, 19).string('СЗО, шт').style(headerStyle);
    sheet.cell(row, 20).string('Кол-во, шт').style(headerStyle);
    sheet.cell(row, 21).string(' P∑, кВт').style(headerStyle);
    sheet.cell(row, 22).string('Запитано от РИСЭ, чел.').style(headerStyle);
    sheet.cell(row, 23).string('Бригад, шт.').style(headerStyle);
    sheet.cell(row, 24).string('Человек').style(headerStyle);
    sheet.cell(row, 25).string('Ед. техн., шт.').style(headerStyle);

    const reports = await this.getReportsByDateAndPeriod(date, period);
    let lep_110_150_count_total = 0;
    let lep_35_count_total = 0;
    let ps_110_150_count_total = 0;
    let ps_35_count_total = 0;
    let tp_6_20_count_effect_35_150_total = 0;
    let population_count_effect_35_150_total = 0;
    let power_effect_35_150_total = 0;
    let szo_count_effect_35_150_total = 0;
    let lep_6_20_count_total = 0;
    let tp_6_20_count_total = 0;
    let population_count_effect_raspr_total = 0;
    let power_effect_raspr_total = 0;
    let szo_count_effect_raspr_total = 0;
    let effect_tp_6_20_total = 0;
    let effect_population_total = 0;
    let effect_power_total = 0;
    let effect_szo_total = 0;
    let resources_rise_count_total = 0;
    let resources_rise_sum_power_total = 0;
    let resources_rise_people_total = 0;
    let resources_brigades_total = 0;
    let resources_people_total = 0;
    let resources_technics_total = 0;

    reports.data.forEach((report: IOperativeSituationReport) => {
      row++;
      sheet.row(row).setHeight(25);
      sheet.cell(row, 2).string(report.company.shortTitle).style(contentStyle);
      sheet.cell(row, 3).number(report.lep_110_150_count).style(contentStyle);
      lep_110_150_count_total += report.lep_110_150_count;
      sheet.cell(row, 4).number(report.lep_35_count).style(contentStyle);
      lep_35_count_total += report.lep_35_count;
      sheet.cell(row, 5).number(report.ps_110_150_count).style(contentStyle);
      ps_110_150_count_total += report.ps_110_150_count;
      sheet.cell(row, 6).number(report.ps_35_count).style(contentStyle);
      ps_35_count_total += report.ps_35_count;
      sheet.cell(row, 7).number(report.tp_6_20_count_effect_35_150).style(contentStyle);
      tp_6_20_count_effect_35_150_total += report.tp_6_20_count_effect_35_150;
      sheet.cell(row, 8).number(report.population_count_effect_35_150).style(contentStyle);
      population_count_effect_35_150_total += report.population_count_effect_35_150;
      sheet.cell(row, 9).number(report.power_effect_35_150).style(contentStyle);
      power_effect_35_150_total += report.power_effect_35_150;
      sheet.cell(row, 10).number(report.szo_count_effect_35_150).style(contentStyle);
      szo_count_effect_35_150_total += report.szo_count_effect_35_150;
      sheet.cell(row, 11).number(report.lep_6_20_count).style(contentStyle);
      lep_6_20_count_total += report.lep_6_20_count;
      sheet.cell(row, 12).number(report.tp_6_20_count).style(contentStyle);
      tp_6_20_count_total += report.tp_6_20_count;
      sheet.cell(row, 13).number(report.population_count_effect_raspr).style(contentStyle);
      population_count_effect_raspr_total += report.population_count_effect_raspr;
      sheet.cell(row, 14).number(report.power_effect_raspr).style(contentStyle);
      power_effect_raspr_total += report.power_effect_raspr;
      sheet.cell(row, 15).number(report.szo_count_effect_raspr).style(contentStyle);
      szo_count_effect_raspr_total += report.szo_count_effect_raspr;
      sheet.cell(row, 16)
        .number(report.tp_6_20_count_effect_35_150 + report.tp_6_20_count)
        .style(contentStyle)
        .style(summaryStyle)
        .style(regularStyle);
      effect_tp_6_20_total += report.tp_6_20_count_effect_35_150 + report.tp_6_20_count;
      sheet.cell(row, 17)
        .number(report.population_count_effect_35_150 + report.population_count_effect_raspr)
        .style(contentStyle)
        .style(summaryStyle)
        .style(regularStyle);
      effect_population_total += report.population_count_effect_35_150 + report.population_count_effect_raspr;
      sheet.cell(row, 18).number(report.power_effect_35_150 + report.power_effect_raspr).style(contentStyle).style(summaryStyle).style(regularStyle);
      effect_power_total += report.power_effect_35_150 + report.power_effect_raspr;
      sheet.cell(row, 19)
        .number(report.szo_count_effect_35_150 + report.szo_count_effect_raspr)
        .style(contentStyle)
        .style(summaryStyle)
        .style(regularStyle);
      effect_szo_total += report.szo_count_effect_35_150 + report.szo_count_effect_raspr;
      sheet.cell(row, 20).number(report.resourcesRiseCount).style(contentStyle);
      resources_rise_count_total += report.resourcesRiseCount;
      sheet.cell(row, 21).number(report.resourcesRiseSumPower).style(contentStyle);
      resources_rise_sum_power_total += report.resourcesRiseSumPower;
      sheet.cell(row, 22).number(report.resourcesRisePeople).style(contentStyle);
      resources_rise_people_total += report.resourcesRisePeople;
      sheet.cell(row, 23).number(report.resourcesBrigades).style(contentStyle);
      resources_brigades_total += report.resourcesBrigades;
      sheet.cell(row, 24).number(report.resourcesPeople).style(contentStyle);
      resources_people_total += report.resourcesPeople;
      sheet.cell(row, 25).number(report.resourcesTechnics).style(contentStyle);
      resources_technics_total += report.resourcesTechnics;
    });
    row++;
    sheet.row(row).setHeight(25);
    sheet.cell(row, 2).string('МРСК Северо-Запада').style(contentStyle).style(summaryStyle);
    sheet.cell(row, 3).number(lep_110_150_count_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 4).number(lep_35_count_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 5).number(ps_110_150_count_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 6).number(ps_35_count_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 7).number(tp_6_20_count_effect_35_150_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 8).number(population_count_effect_35_150_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 9).number(power_effect_35_150_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 10).number(szo_count_effect_35_150_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 11).number(lep_6_20_count_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 12).number(tp_6_20_count_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 13).number(population_count_effect_raspr_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 14).number(power_effect_raspr_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 15).number(szo_count_effect_raspr_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 16).number(effect_tp_6_20_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 17).number(effect_population_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 18).number(effect_power_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 19).number(effect_szo_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 20).number(resources_rise_count_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 21).number(resources_rise_sum_power_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 22).number(resources_rise_people_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 23).number(resources_brigades_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 24).number(resources_people_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 25).number(resources_technics_total).style(contentStyle).style(summaryStyle);

    row += 2;
    sheet.row(row).setHeight(45);
    let violations_6_total = 0;
    let violations_35_uapv_total = 0;
    let violations_35_napv_total = 0;
    let violations_35_power_off_total = 0;
    let uapv_and_napv_total = 0;
    let violations_lep_rs_total = 0;
    let violations_tn_cancel_total = 0;
    let violations_04_from_6_total = 0;
    let violations_04_power_off_total = 0;
    let violations_04_greater_3_total = 0;
    let violations_population_04_srez_total = 0;
    let violations_population_04_greater_3_total = 0;

    sheet.cell(row, 2, row + 1, 2, true).string('Филиал').style(headerStyle);
    sheet.cell(row, 3, row + 1, 3, true).string('Всего 6 кВ и выше').style(headerStyle);
    sheet.cell(row, 4, row, 7, true).string('Основная сеть 35 кВ и выше').style(headerStyle);
    sheet.cell(row, 8, row + 1, 8, true).string('ЛЭП р/с').style(headerStyle);
    sheet.cell(row, 9, row + 1, 9, true).string('ТН с погаш.').style(headerStyle);
    sheet.cell(row, 10, row, 12, true).string('Сеть 0,4 кВ').style(headerStyle);
    sheet.cell(row, 13, row, 14, true).string('Население, чел.').style(headerStyle);
    row++;
    sheet.row(row).setHeight(45);
    sheet.cell(row, 4).string('УАПВ').style(headerStyle);
    sheet.cell(row, 5).string('НАПВ').style(headerStyle);
    sheet.cell(row, 6).string('С обесточ.').style(headerStyle);
    sheet.cell(row, 7).string('Итого').style(headerStyle);
    sheet.cell(row, 10).string('С 6-00').style(headerStyle);
    sheet.cell(row, 11).string('Отключены на срез').style(headerStyle);
    sheet.cell(row, 12).string('Более 3 часов').style(headerStyle);
    sheet.cell(row, 13).string('По сети 0,4 кВ на срез').style(headerStyle);
    sheet.cell(row, 14).string('По сети 0,4 кВ (более 3 часов)').style(headerStyle);
    reports.data.forEach((report: IOperativeSituationReport) => {
      row++;
      sheet.row(row).setHeight(25);
      sheet.cell(row, 2).string(report.company.shortTitle).style(contentStyle);
      sheet.cell(row, 3).number(report.violations_6).style(contentStyle);
      violations_6_total += report.violations_6;
      sheet.cell(row, 4).number(report.violations_35_uapv).style(contentStyle);
      violations_35_uapv_total += report.violations_35_uapv;
      sheet.cell(row, 5).number(report.violations_35_napv).style(contentStyle);
      violations_35_napv_total += report.violations_35_napv;
      sheet.cell(row, 6).number(report.violations_35_power_off).style(contentStyle);
      violations_35_power_off_total += report.violations_35_power_off;
      sheet.cell(row, 7).number(report.violations_35_uapv + report.violations_35_napv).style(contentStyle);
      uapv_and_napv_total += report.violations_35_uapv + report.violations_35_napv;
      sheet.cell(row, 8).number(report.violations_lep_rs).style(contentStyle);
      violations_lep_rs_total += report.violations_lep_rs;
      sheet.cell(row, 9).number(report.violations_tn_cancel).style(contentStyle).style(summaryStyle);
      violations_tn_cancel_total += report.violations_tn_cancel;
      sheet.cell(row, 10).number(report.violations_04_from_6).style(contentStyle).style(summaryStyle);
      violations_04_from_6_total += report.violations_04_from_6;
      sheet.cell(row, 11).number(report.violations_04_power_off).style(contentStyle);
      violations_04_power_off_total += report.violations_04_power_off;
      sheet.cell(row, 12).number(report.violations_04_greater_3).style(contentStyle);
      violations_04_greater_3_total += report.violations_04_greater_3;
      sheet.cell(row, 13).number(report.violations_population_04_srez).style(contentStyle);
      violations_population_04_srez_total += report.violations_population_04_srez;
      sheet.cell(row, 14).number(report.violations_population_04_greater_3).style(contentStyle);
      violations_population_04_greater_3_total += report.violations_population_04_greater_3;
    });
    row++;
    sheet.row(row).setHeight(25);
    sheet.cell(row, 2).string('МРСК Северо-Запада').style(contentStyle).style(summaryStyle);
    sheet.cell(row, 3).number(violations_6_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 4).number(violations_35_uapv_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 5).number(violations_35_napv_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 6).number(violations_35_power_off_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 7).number(uapv_and_napv_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 8).number(violations_lep_rs_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 9).number(violations_tn_cancel_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 10).number(violations_04_from_6_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 11).number(violations_04_power_off_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 12).number(violations_04_greater_3_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 13).number(violations_population_04_srez_total).style(contentStyle).style(summaryStyle);
    sheet.cell(row, 14).number(violations_population_04_greater_3_total).style(contentStyle).style(summaryStyle);

    row = row - reports.data.length - 2;
    sheet.cell(row, 16, row, 19, true).string('Потребление').style(headerStyle);
    row++;
    sheet.cell(row, 16, row, 17, true).string('Филиал').style(headerStyle);
    sheet.cell(row, 18, row, 19, true).string('Максимум потребления за прошедшие сутки').style(headerStyle);
    let consumption_total = 0;
    reports.data.forEach((report: IOperativeSituationReport) => {
      row++;
      sheet.row(row).setHeight(25);
      sheet.cell(row, 16, row, 17, true).string(report.company.shortTitle).style(contentStyle);
      sheet.cell(row, 18, row, 19, true).number(report.consumption ? report.consumption.consumption : 0).style(contentStyle);
      consumption_total += report.consumption ? report.consumption.consumption : 0;
    });
    row++;
    sheet.row(row).setHeight(25);
    sheet.cell(row, 16, row, 17, true).string('МРСК Северо-Запада').style(contentStyle).style(summaryStyle);
    sheet.cell(row, 18, row, 19, true).number(consumption_total).style(contentStyle).style(summaryStyle);

    row = row - reports.data.length - 2;
    sheet.cell(row, 21, row, 27, true).string('Погодные условия').style(headerStyle);
    sheet.cell(row, 28).string('Режимы').style(headerStyle);
    row++;
    sheet.cell(row, 21, row, 22, true).string('Филиал').style(headerStyle);
    sheet.cell(row, 23).string('t min').style(headerStyle);
    sheet.cell(row, 24).string('t max').style(headerStyle);
    sheet.cell(row, 25).string('Ветер, м/с').style(headerStyle);
    sheet.cell(row, 26, row, 27, true).string('Осадки').style(headerStyle);
    sheet.cell(row, 28).string('РПГ / ОРР').style(headerStyle);
    reports.data.forEach((report: IOperativeSituationReport) => {
      row++;
      sheet.row(row).setHeight(25);
      sheet.cell(row, 21, row, 22, true).string(report.company.shortTitle).style(contentStyle);
      if (report.weatherSummary) {
        let minTemperature = report.weatherSummary.locations[0].weather.temperature;
        let maxTemperature = report.weatherSummary.locations[0].weather.temperature;
        let minWindSpeed = report.weatherSummary.locations[0].weather.wind;
        let maxWindSpeed = report.weatherSummary.locations[0].weather.wind;
        const precipitations = [];
        report.weatherSummary.locations.forEach((location: ILocation) => {
          minTemperature = location.weather.temperature < minTemperature ? location.weather.temperature : minTemperature;
          maxTemperature = location.weather.temperature > maxTemperature ? location.weather.temperature : maxTemperature;
          minWindSpeed = location.weather.wind < minWindSpeed ? location.weather.wind : minWindSpeed;
          maxWindSpeed = location.weather.wind > maxWindSpeed ? location.weather.wind : maxWindSpeed;
          if (location.weather.precipitations !== 'ясно' &&  precipitations.indexOf(location.weather.precipitations) === -1) {
            precipitations.push(location.weather.precipitations);
          }
          sheet.cell(row, 23).number(minTemperature).style(contentStyle);
          sheet.cell(row, 24).number(maxTemperature).style(contentStyle);
          sheet.cell(row, 25).string(`${minWindSpeed}-${maxWindSpeed}`).style(contentStyle);
          sheet.cell(row, 26, row, 27, true).string(precipitations.length > 0 ? precipitations.join(', ') : 'Нет').style(contentStyle);
          sheet.cell(row, 28).string(report.weatherORR ? 'ОРР' : report.weatherRPG ? 'РПГ' : 'Нет').style(contentStyle);
        });
      } else {
        sheet.cell(row, 23).number(report.weatherMin).style(contentStyle);
        sheet.cell(row, 24).number(report.weatherMax).style(contentStyle);
        sheet.cell(row, 25).string(report.weatherWind).style(contentStyle);
        sheet.cell(row, 26, row, 27, true).string(report.weatherPrecipitations).style(contentStyle);
        sheet.cell(row, 28).string(report.weatherORR ? 'ОРР' : report.weatherRPG ? 'РПГ' : 'Нет').style(contentStyle);
      }
    });

    return new Promise<string>((resolve, reject) => {
      wb.write(`${date} ${period.replace(':', '-')}.xlsx`, (err, stats) => {
        if (err) {
          reject(null);
        }
        const url = path.resolve(`./${date} ${period.replace(':', '-')}.xlsx`);
        resolve(url);
      });
    });
  }

  getPeriodByTime(periods: IPeriod[]): IPeriod {
    let result = null;
    const now = moment();
    periods.forEach((period: IPeriod) => {
      const start = moment(`${now.format('DD.MM.YYYY')} ${period.start}`, 'DD.MM.YYYY HH:mm').unix();
      const end = moment(`${now.format('DD.MM.YYYY')} ${period.end}`, 'DD.MM.YYYY HH:mm').unix();
      if (now.unix() >= start && now.unix() < end) {
        result = period;
      }
    });
    return result;
  }
}
