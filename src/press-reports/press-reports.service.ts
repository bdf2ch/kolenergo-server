import { Component } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { IServerResponse } from '@kolenergo/core';
import { IApplicationInitialData, IPressReport, PressReport } from '@kolenergo/press';
import moment = require('moment');

@Component()
export class PressReportsService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Получение данных для инициализации приложения
   */
  async getInitialData(): Promise<IServerResponse<IApplicationInitialData>> {
    const now = moment().startOf('day');
    const result = await this.postgresService.query(
      'press-get-initial-data',
      'SELECT press.get_initial_data($1)',
      [now.format('DD.MM.YYYY')],
      'get_initial_data',
    );
    return result;
  }

  /**
   * Получение отчетов о публикациях в СМИ за указанную дату
   * @param date - Дата
   */
  async getReportsByDate(date: string): Promise<IServerResponse<IPressReport[]>> {
    const result = await this.postgresService.query(
      'press-get-reports-by-date',
      'SELECT press.get_reports_by_date($1)',
      [date],
      'get_reports_by_date',
    );
    return result;
  }

  /**
   * Доьбавление отчетов о публикациях в СМИ
   * @param reports - Отчеты о публикациях в СМИ
   */
  async addReports(reports: PressReport[]): Promise<IServerResponse<IPressReport[]>> {
    const result = await this.postgresService.query(
      'press-add-report',
      'SELECT press.add_report($1)',
      [reports],
      'add_report',
    );
    return result;
  }

  /**
   * Изменение отчетов о публикациях в СМИ
   * @param reports - Изменяемые отчеты
   */
  async editReports(reports: PressReport[]): Promise<IServerResponse<IPressReport[]>> {
    const result = this.postgresService.query(
      'press-edit-report',
      'SELECT press.edit_report($1)',
      [reports],
      'edit_report',
    );
    return result;
  }

  /**
   * Удаление отчетов о публикациях в СМИ за указанную дату
   * @param date - Дата
   */
  async deleteReportsByDate(date: string): Promise<IServerResponse<boolean>> {
    const result = await this.postgresService.query(
      'press-delete-reports',
      'SELECT press.remove_reports_by_date($1)',
      [date],
      'remove_reports_by_date',
    );
    return result;
  }
}
