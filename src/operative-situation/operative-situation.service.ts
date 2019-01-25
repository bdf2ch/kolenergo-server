import { Component } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { IServerResponse } from '@kolenergo/cpa';
import {
  IOperativeSituationReport,
  IOperativeSituationWeatherReport,
  IOperativeSituationReportsInitialData,
  OperativeSituationReport,
  OperativeSituationConsumption,
  IOperativeSituationConsumption, IOperativeSituationRegion,
} from '@kolenergo/osr';
import moment = require('moment');
import * as https from 'https';

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
    let minWind = 0;
    let maxWind = 0;
    let minHumidity = 0;
    let maxHumidity = 0;
    let precipitations = [];
    const regions = await this.postgresService.query(
      'get-weather-regions',
      'SELECT * FROM operative_situation_reports_weather_regions',
      [],
      '',
    );

    regions.forEach((reg: IOperativeSituationRegion) => {
      const request = https.get(
        `https://api.openweathermap.org/data/2.5/box/city?bbox=${reg.leftBottomPosition.y},${reg.leftBottomPosition.x},${reg.rightTopPosition.y},${reg.rightTopPosition.x},10&units=metric&lang=ru&appid=${apiKey}`,
        (response: any) => {
          let data = '';
          response.on('data', (chunk) => {
            data += chunk;
          });
          response.on('end', async () => {
            const weather = JSON.parse(data);
            minTemperature = weather['list'][0]['main']['temp_min'];
            maxTemperature = weather['list'][0]['main']['temp_max'];
            minWind = weather['list'][0]['wind']['speed'];
            maxWind = weather['list'][0]['wind']['speed'];
            minHumidity = weather['list'][0]['main']['humidity'];
            maxHumidity = weather['list'][0]['main']['humidity'];
            let date = null;
            weather['list'].forEach((city: any) => {
              /*
              console.log('city', city['name']);
              console.log('min_temp', city['main']['temp_min']);
              console.log('max_temp', city['main']['temp_max']);
              console.log('wind', city['wind']['speed']);
              console.log('description', city['weather']);
              console.log('description', city['weather'][0]['description']);
              */
              date = moment.unix(city['dt']);
              minTemperature = city['main']['temp_min'] < minTemperature ? city['main']['temp_min'] : minTemperature;
              maxTemperature = city['main']['temp_max'] > maxTemperature ? city['main']['temp_max'] : maxTemperature;
              minWind = city['wind']['speed'] < minWind ? city['wind']['speed'] : minWind;
              maxWind = city['wind']['speed'] > maxWind ? city['wind']['speed'] : maxWind;
              minHumidity = city['main']['humidity'] < minHumidity ? city['main']['humidity'] : minHumidity;
              maxHumidity = city['main']['humidity'] > maxHumidity ? city['main']['humidity'] : maxHumidity;
              if (precipitations.indexOf(city['weather'][0]['description']) === -1) {
                  precipitations.push(city['weather'][0]['description'].replace('"', ''));
              }
              // precipitations = city['weather'][0]['description'];
            });
            const result = await this.postgresService.query(
              'add-weather',
              'SELECT operative_situation_reports_weather_add($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
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
              ],
              'operative_situation_reports_weather_add',
            );
            return result;
          });
        });
    });
  }
}