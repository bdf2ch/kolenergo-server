import { Component } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { IServerResponse } from '@kolenergo/core';
import { IPortalInitialData } from '@kolenergo/portal';

@Component()
export class PortalService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Получение данных для инициализации приложения
   * @param advertsOnPage - Количество объявлений на главной странице
   * @param articlesOnPage - Количество статей на главной странице
   */
  async getInitialData(advertsOnPage: number, articlesOnPage: number): Promise<IServerResponse<IPortalInitialData>> {
    const result = await this.postgresService.query(
      'portal-get-initial-data',
      'SELECT portal.get_initial_data($1, $2)',
      [advertsOnPage, articlesOnPage],
      'get_initial_data',
    );
    return result;
  }
}
