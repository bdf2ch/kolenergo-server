import { Component } from '@nestjs/common';

import { PostgresService } from '../common/database/postgres.service';
import { IServerResponse } from '@kolenergo/core';
import { IInitialData } from '@kolenergo/phones';

@Component()
export class PhoneBookService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Получение данных для инициализации приложения
   * @param advertsOnPage - Количество объявлений на главной странице
   * @param articlesOnPage - Количество статей на главной странице
   */
  async getInitialData(): Promise<IServerResponse<IInitialData>> {
    const result = await this.postgresService.query(
      'phones-get-initial-data',
      'SELECT phones.get_initial_data()',
      [],
      'get_initial_data',
    );
    return result;
  }
}
