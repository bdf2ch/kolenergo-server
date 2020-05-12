import { Component } from '@nestjs/common';
import moment = require('moment');

import { PostgresService } from '../common/database/postgres.service';
import { IServerResponse } from '@kolenergo/core';
import { IAppInitData } from '@kolenergo/osr2';

@Component()
export class OSRService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Получение данных для инициализации приложения
   * @param companyId - Идентификатор организации
   */
  async getInitialData(companyId: number): Promise<IServerResponse<IAppInitData>> {
    const date = moment();
    return await this.postgresService.query(
      'osr-get-initial-data',
      'SELECT osr.get_initial_data($1, $2)',
      [
        companyId,
        date.format('DD.MM.YYYY'),
      ],
      'get_initial_data',
    );
  }
}
