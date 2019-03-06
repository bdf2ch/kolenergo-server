import { Component } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { ICompany, IServerResponse } from '@kolenergo/cpa';
import {
  IOperativeSituationReport,
  IOperativeSituationWeatherReport,
  IOperativeSituationReportsInitialData,
  OperativeSituationReport,
  OperativeSituationConsumption,
  IOperativeSituationConsumption, IOperativeSituationRegion, IWeatherSummary, ILocation, IWeatherSummaryResponse, ILocationWeather,
} from '@kolenergo/osr';
import moment = require('moment');
import * as https from 'https';
import * as path from 'path';
import * as excel from 'excel4node';

@Component()
export class OperativeSituationService {
  constructor(private readonly postgresService: PostgresService) {
  }

  /**
   * Получение данных для инициализации приложения
   * @param companyId
   */
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
   * Получение всех отчетов об оперативной обстановке
   */
  async getAllReports(): Promise<IOperativeSituationReport[]> {
    const result = await this.postgresService.query(
      'operative-situation-reports-get-all',
      `SELECT * FROM operative_situation_reports`,
      [],
      '',
    );
    return result;
  }

  /**
   * Получение отчетов об оперативной обстановке по дате
   */
  async getReportsByDate(companyId: number, date: string): Promise<IServerResponse<IOperativeSituationReportsInitialData>> {
    const result = await this.postgresService.query(
      'operative-situation-reports-get-by-date',
      `SELECT operative_situation_reports_get_by_date($1, $2)`,
      [companyId, date],
      'operative_situation_reports_get_by_date',
    );
    return result;
  }

  /**
   * Добавление отчета обоперативной обстановке
   * @param report - Добавляемый отчет об оперативной обстановке
   */
  async addReport(report: OperativeSituationReport): Promise<IServerResponse<IOperativeSituationReport>> {
    const date = moment();
    const result = await this.postgresService.query(
      'add-operative-situation-report',
      `SELECT operative_situation_reports_add(
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                  $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
                  $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40
                )`,
      [
        report.company.id,
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
    return result ? result : null;
  }

  /**
   * Изменение отчета об оперативной обстановке
   * @param report - Изменяемый отчет об оперативной обстановке
   */
  async editReport(report: OperativeSituationReport): Promise<IServerResponse<IOperativeSituationReport>> {
    const result = await this.postgresService.query(
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
    return result ? result : null;
  }

  /**
   * Добавление отчета о максимальном потреблении за прошедшие сутки
   * @param report - Добавляемый отчет об максимальном потреблении за прошедшие сутки
   */
  async addConsumption(consumption: OperativeSituationConsumption): Promise<IServerResponse<IOperativeSituationConsumption>> {
    const date = moment();
    const result = await this.postgresService.query(
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
    return result ? result : null;
  }

  /**
   * Изменение отчета о максимальном потреблении за прошедшие сутки
   * @param consumption - Изменяемый отчет о максималньо потреблении за прошедшие сутки
   */
  async editConsumption(consumption: OperativeSituationConsumption): Promise<IServerResponse<IOperativeSituationConsumption>> {
    const result = await this.postgresService.query(
      'edit-operative-situation-report_consumption',
      `SELECT operative_situation_reports_consumption_edit($1, $2)`,
      [
        consumption.id,
        consumption.consumption,
      ],
      'operative_situation_reports_consumption_edit',
    );
    return result ? result : null;
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

    regions.forEach((reg: IOperativeSituationRegion) => {
      const request = https.get(
        `https://api.openweathermap.org/data/2.5/box/city?bbox=${reg.leftBottomPosition.y},${reg.leftBottomPosition.x},${reg.rightTopPosition.y},${reg.rightTopPosition.x},${reg.zoom}&units=metric&lang=ru&appid=${apiKey}`,
        (response: any) => {
          let data = '';
          response.on('data', (chunk) => {
            data += chunk;
          });
          response.on('end', async () => {
            const weather = JSON.parse(data);
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
              /*
              console.log('city', city['name']);
              console.log('min_temp', city['main']['temp_min']);
              console.log('max_temp', city['main']['temp_max']);
              console.log('wind', city['wind']['speed']);
              console.log('description', city['weather']);
              console.log('description', city['weather'][0]['description']);
              */
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
            const result = await this.postgresService.query(
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
            return result;
          });
        });
    });
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
            weather.weather[0].description,
            weather.weather[0].main,
            weather.weather[0].icon,
          ],
          'operative_situation_reports_locations_weather_add',
        );
        loc.weather = locationWeather;
        /*
        if (index === locations.length - 1) {
          await this.postgresService.query(
            'complete-weather-summary',
            'UPDATE operative_situation_reports_weather_summary SET "isCompleted" = true WHERE "id" = $1',
            [summary.data.id],
            '',
          );
        }
        */
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
    return new Promise((resolve, reject) => {
      https.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${loc.coordinates.x}&lon=${loc.coordinates.y}&units=metric&lang=ru&appid=${apiKey}`,
        (response: any) => {
          let data = '';
          response.on('data', (chunk) => {
            data += chunk;
          });
          response.on('end', async () => {
            let weather: IWeatherSummaryResponse = null;
            try {
              weather = JSON.parse(data);
            } catch (e) {
              reject(e);
            }
            resolve(weather);
          });
        }).on('error', (e) => {
            reject(e);
        });
    });
  }

  exportReport(reportId: number): Promise<string> {
    const wb = new excel.Workbook();
    const sheet = wb.addWorksheet('Оперативная обстановка');
    const border = {
      style: 'thin',
      color: 'black',
    };
    const borderedStyle = wb.createStyle({
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
    const contentStyle = wb.createStyle({
      alignment: {
        horizontal: 'left',
        vertical: 'top',
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

    sheet.row(1).setHeight(30);
    sheet.cell(1, 2).string('Оперативная обстановка по состоянию на 06:00 05.03.2019').style(titleStyle);

    sheet.row(3).setHeight(35);
    sheet.cell(3, 2, 4, 2, true).string('Филиал').style(borderedStyle);
    sheet.cell(3, 3, 3, 6, true).string('Отключенное оборудование по сети 35-150 кВ').style(borderedStyle);
    sheet.cell(3, 7, 3, 10, true).string('Последствия для потребителей по сети 35-150 кВ').style(borderedStyle);
    sheet.cell(3, 11, 3, 12, true).string('Распределительная сеть').style(borderedStyle);
    sheet.cell(3, 13, 3, 15, true).string('Последствия для потребителей по распределительной сети').style(borderedStyle);
    sheet.cell(3, 16, 3, 19, true).string('Последствия для потребителей суммарно по основной и распределительной сети').style(borderedStyle);
    sheet.cell(3, 20, 3, 22, true).string('Задействованные РИСЭ').style(borderedStyle);
    sheet.cell(3, 23, 3, 25, true).string('Задействованные силы и средства').style(borderedStyle);

    sheet.row(4).setHeight(35);
    sheet.cell(4, 3).string('ЛЭП 110-150 кВ, шт.').style(borderedStyle);
    sheet.cell(4, 4).string('ЛЭП 35 кВ, шт.').style(borderedStyle);
    sheet.cell(4, 5).string('ПС 110 -150 кВ, шт.').style(borderedStyle);
    sheet.cell(4, 6).string('ПС 35 кВ, шт.').style(borderedStyle);
    sheet.cell(4, 7).string('ТП 6-20 кВ, шт.').style(borderedStyle);
    sheet.cell(4, 8).string('Население, чел').style(borderedStyle);
    sheet.cell(4, 9).string('Нагрузка, МВт').style(borderedStyle);
    sheet.cell(4, 10).string('СЗО, шт').style(borderedStyle);
    sheet.cell(4, 11).string('ЛЭП 6-20 кВ, шт.').style(borderedStyle);
    sheet.cell(4, 12).string('ТП 6-20 кВ, шт.').style(borderedStyle);
    sheet.cell(4, 13).string('Население, чел').style(borderedStyle);
    sheet.cell(4, 14).string('Нагрузка, МВт').style(borderedStyle);
    sheet.cell(4, 15).string('СЗО, шт').style(borderedStyle);
    sheet.cell(4, 16).string('ТП 6-20 кВ, шт.').style(borderedStyle);
    sheet.cell(4, 17).string('Население, чел').style(borderedStyle);
    sheet.cell(4, 18).string('Нагрузка, МВт').style(borderedStyle);
    sheet.cell(4, 19).string('СЗО, шт').style(borderedStyle);
    sheet.cell(4, 20).string('Кол-во, шт').style(borderedStyle);
    sheet.cell(4, 21).string(' P∑, кВт').style(borderedStyle);
    sheet.cell(4, 22).string('Запитано от РИСЭ, чел.').style(borderedStyle);
    sheet.cell(4, 23).string('Бригад, шт.').style(borderedStyle);
    sheet.cell(4, 24).string('Человек').style(borderedStyle);
    sheet.cell(4, 25).string('Ед. техн., шт.').style(borderedStyle);

    const row = 4;

    return new Promise<string>((resolve, reject) => {
      wb.write(`${reportId}.xlsx`, (err, stats) => {
        if (err) {
          reject(null);
        }
        const url = path.resolve(`./${reportId}.xlsx`);
        resolve(url);
      });
    });
  }
}
