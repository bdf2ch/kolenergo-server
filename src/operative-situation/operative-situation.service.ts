import { Component } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { ICompany, IServerResponse } from '@kolenergo/cpa';
import {
  IOperativeSituationReport,
  IOperativeSituationWeatherReport,
  IOperativeSituationReportsInitialData,
  OperativeSituationReport,
  OperativeSituationConsumption,
  IOperativeSituationConsumption, IOperativeSituationRegion, IWeatherSummary, ILocation, IWeatherSummaryResponse,
} from '@kolenergo/osr';
import moment = require('moment');
import * as path from 'path';
import * as excel from 'excel4node';
import rpn = require('request-promise-native');

@Component()
export class OperativeSituationService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Получение данных для инициализации приложения
   * @param companyId
   */
  async getInitialData(companyId: number): Promise<IServerResponse<IOperativeSituationReportsInitialData>> {
    const date = moment();
    return await this.postgresService.query(
      'operative-situation-reports-get-initial-data',
      'SELECT operative_situation_reports_get_initial_data($1, $2)',
      [
        companyId,
        date.format('DD.MM.YYYY'),
      ],
      'SELECT operative_situation_reports_get_initial_data',
    );
  }

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
      'operative-situation-reports-get-by-date-and-period',
      `SELECT operative_situation_reports_get_by_date_and_period($1, $2)`,
      [date, period],
      'operative_situation_reports_get_by_date_and_period',
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
  async addReport(report: OperativeSituationReport): Promise<IServerResponse<IOperativeSituationReport>> {
    const date = moment();
    return await this.postgresService.query(
      'add-operative-situation-report',
      `SELECT operative_situation_reports_add(
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                  $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
                  $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41
                )`,
      [
        report.company.id,
        // report.divisionId,
        report.user.id,
        date.format('DD.MM.YYYY'),
        report.periodTime,
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
        report.violations.greater_3_04,
        report.violations.population_srez_04,
        report.violations.population_greater_3_04,
        report.resources.rise,
        report.resources.riseSumPower,
        report.resources.risePeople,
        report.weatherSummary ? report.weatherSummary.id : 0,
      ],
      'operative_situation_reports_add',
    );
  }

  /**
   * Изменение отчета об оперативной обстановке
   * @param report - Изменяемый отчет об оперативной обстановке
   */
  async editReport(report: OperativeSituationReport): Promise<IServerResponse<IOperativeSituationReport>> {
    return await this.postgresService.query(
      'edit-operative-situation-report',
      `SELECT operative_situation_reports_edit(
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                  $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
                  $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37
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
        report.resources.rise,
        report.resources.riseSumPower,
        report.resources.risePeople,
      ],
      'operative_situation_reports_edit',
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

  /**
   * Добавление отчета о максимальном потреблении за прошедшие сутки
   * @param consumption - Добавляемый отчет об максимальном потреблении за прошедшие сутки
   */
  async addConsumption(consumption: OperativeSituationConsumption): Promise<IServerResponse<IOperativeSituationConsumption>> {
    const date = moment();
    return await this.postgresService.query(
      'add-operative-situation-consumption',
      `SELECT operative_situation_reports_consumption_add($1, $2, $3, $4)`,
      [
        consumption.company.id,
        consumption.user.id,
        date.format('DD.MM.YYYY'),
        consumption.consumption,
      ],
      'operative_situation_reports_consumption_add',
    );
  }

  /**
   * Изменение отчета о максимальном потреблении за прошедшие сутки
   * @param consumption - Изменяемый отчет о максималньо потреблении за прошедшие сутки
   */
  async editConsumption(consumption: OperativeSituationConsumption): Promise<IServerResponse<IOperativeSituationConsumption>> {
    return await this.postgresService.query(
      'edit-operative-situation-report_consumption',
      `SELECT operative_situation_reports_consumption_edit($1, $2)`,
      [
        consumption.id,
        consumption.consumption,
      ],
      'operative_situation_reports_consumption_edit',
    );
  }

  /**
   * Добавление погодной сводки
   */
  async addWeather(): Promise<IServerResponse<IOperativeSituationWeatherReport>> {
    const apiKey = '7d76240ac937e51c8544c06d87e8be27';
    let minTemperature = 0;
    let maxTemperature = 0;
    let minHumidity = 0;
    let maxHumidity = 0;
    let minPressure = 0;
    let maxPressure = 0;
    let minWind = 0;
    let maxWind = 0;
    const precipitations = [];
    const weatherGroups = [];
    const icons = [];
    const regions = await this.postgresService.query(
      'get-weather-regions',
      'SELECT * FROM operative_situation_reports_weather_regions',
      [],
      '',
    );
    let result: IServerResponse<IOperativeSituationWeatherReport> = null;

    regions.forEach(async (reg: IOperativeSituationRegion) => {
      const options = {
        uri: `https://api.openweathermap.org/data/2.5/box/city`,
        qs: {
          bbox: `${reg.leftBottomPosition.y},${reg.leftBottomPosition.x},${reg.rightTopPosition.y},${reg.rightTopPosition.x},${reg.zoom}`,
          units: 'metric',
          lang: 'ru',
          appid: apiKey,
        },
        json: true,
        proxy: 'http://kolu-proxy2.nw.mrsksevzap.ru:8080',
      };
      const weather = await rpn(options);
      minTemperature = weather.list[0].main.temp_min;
      maxTemperature = weather.list[0].main.temp_max;
      minWind = weather.list[0].wind.speed;
      maxWind = weather.list[0].wind.speed;
      minHumidity = weather.list[0].main.humidity;
      maxHumidity = weather.list[0].main.humidity;
      minPressure = weather.list[0].main.pressure;
      maxPressure = weather.list[0].main.pressure;
      let date = null;
      weather.list.forEach((city: any) => {
        date = moment.unix(city.dt);
        minTemperature = city.main.temp_min < minTemperature ? city.main.temp_min : minTemperature;
        maxTemperature = city.main.temp_max > maxTemperature ? city.main.temp_max : maxTemperature;
        minWind = city.wind.speed < minWind ? city.wind.speed : minWind;
        maxWind = city.wind.speed > maxWind ? city.wind.speed : maxWind;
        minHumidity = city.main.humidity < minHumidity ? city.main.humidity : minHumidity;
        maxHumidity = city.main.humidity > maxHumidity ? city.main.humidity : maxHumidity;
        minPressure = city.main.pressure < minPressure ? city.main.pressure : minPressure;
        maxPressure = city.main.pressure > maxPressure ? city.main.pressure : maxPressure;
        if (precipitations.indexOf(city.weather[0].description) === -1) {
          precipitations.push(city.weather[0].description);
        }
        if (weatherGroups.indexOf(city.weather[0].main) === -1) {
          weatherGroups.push(city.weather[0].main);
        }
        if (icons.indexOf(city.weather[0].icon) === -1) {
          icons.push(city.weather[0].icon);
        }
      });
      result = await this.postgresService.query(
        'add-weather',
        'SELECT operative_situation_reports_weather_add($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
        [
          reg.companyId,
          reg.id,
          date.format('DD.MM.YYYY'),
          date.format('HH:mm'),
          Math.ceil(minTemperature),
          Math.ceil(maxTemperature),
          Math.ceil(minHumidity),
          Math.ceil(maxHumidity),
          `${Math.round(minWind)}-${Math.round(maxWind)}`,
          precipitations,
          minPressure,
          maxPressure,
          weatherGroups,
          icons,
        ],
        'operative_situation_reports_weather_add',
      );
    });
    return result;
  }

  /**
   * Добавление погодной сводки для каждой организации
   */
  async addWeatherSummary(): Promise<IServerResponse<IWeatherSummary[]>> {
    const result: IServerResponse<IWeatherSummary[]> = {
      data: [],
    };
    const apiKey = '7d76240ac937e51c8544c06d87e8be27';
    const companies: ICompany[] = await this.postgresService.query(
      'get-companies',
      'SELECT * FROM companies ORDER BY "id"',
      [],
      '',
    );

    companies.forEach(async (company: ICompany) => {
      const summary: IServerResponse<IWeatherSummary> = await this.postgresService.query(
        'add-weather-summary',
        'SELECT operative_situation_reports_weather_summary_add($1)',
        [company.id],
        'operative_situation_reports_weather_summary_add',
      );
      const locations = await this.postgresService.query(
        'get-weather-locations',
        'SELECT * FROM operative_situation_reports_locations WHERE "companyId" = $1',
        [company.id],
        '',
      );
      locations.forEach(async (loc: ILocation, index: number) => {
        const weather = await this.getLocationWeather(apiKey, loc);
        const locationWeather = await this.postgresService.query(
          'add-location-weather',
          'SELECT operative_situation_reports_locations_weather_add($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
          [
            summary.data.id,
            loc.companyId,
            loc.id,
            moment.unix(weather.dt).format('DD.MM.YYYY'),
            moment.unix(weather.dt).format('HH:mm'),
            Math.ceil(weather.main.temp),
            Math.ceil(weather.main.humidity),
            weather.main.pressure,
            Math.ceil(weather.wind.speed),
            weather.wind.deg,
            weather.weather[0].description !== 'light rain and snow' ? weather.weather[0].description : 'Легкий дождь со снегом',
            weather.weather[0].main,
            weather.weather[0].icon,
          ],
          'operative_situation_reports_locations_weather_add',
        );
        loc.weather = locationWeather;
      });
      await this.postgresService.query(
        'complete-weather-summary',
        'UPDATE operative_situation_reports_weather_summary SET "isCompleted" = true WHERE "id" = $1',
        [summary.data.id],
        '',
      );
      summary.data.locations = locations;
      result.data.push(summary.data);
    });
    return result;
  }

  /**
   * Выполнение запроса погодной сводки по местоположению
   * @param apiKey - Ключ API openweather.org
   * @param loc - Местоположение
   */
  private getLocationWeather(apiKey: string, loc: ILocation): Promise<IWeatherSummaryResponse> {
    const options = {
      uri: `https://api.openweathermap.org/data/2.5/weather`,
      qs: {
        lat: loc.coordinates.x,
        lon: loc.coordinates.y,
        units: 'metric',
        lang: 'ru',
        appid: apiKey,
      },
      json: true,
      proxy: 'http://kolu-proxy2.nw.mrsksevzap.ru:8080',
    };
    return rpn(options);
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
}
