import { Component } from '@nestjs/common';

import moment = require('moment');
import rpn = require('request-promise-native');

import { ICompany, IServerResponse } from '@kolenergo/cpa';
import { IOperativeSituationWeatherReport, IOperativeSituationRegion, ILocation, IWeatherSummaryResponse } from '@kolenergo/osr';
import { IWeatherSummary } from '@kolenergo/osr2';
import { PostgresService } from '../../common/database/postgres.service';

@Component()
export class WeatherService {
  constructor(private readonly postgresService: PostgresService) {}

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
}
