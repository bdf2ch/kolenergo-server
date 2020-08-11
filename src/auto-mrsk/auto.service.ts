import { Component } from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { IInitialData } from '@kolenergo/auto';
import { PostgresService } from '../common/database/postgres.service';

@Component()
export class AutoService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Получение данных для инициализации приложения
   * @param startTime - Время начала периода
   * @param endTime - Время окончания периода
   */
  async getInitialData(startTime: number, endTime: number): Promise<IServerResponse<IInitialData>> {
    return await this.postgresService.query(
      'auto-mrsk-get-initial-data',
      'SELECT auto_mrsk.get_initial_data($1, $2, $3)',
      [startTime, endTime, 0],
      'get_initial_data',
    );
  }
}
