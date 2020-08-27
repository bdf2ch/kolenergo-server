import { Component } from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { IInitialData } from '@kolenergo/auto';
import { PostgresService } from '../common/database/postgres.service';

@Component()
export class AutoService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Получение данных для инициализации приложения
   * @param date - Дата
   * @param userId - Идентификатор пользователя
   * @param periodStart - Дата и время начала периода календаря в формате Unix
   * @param periodEnd - Дата и время окончания периода календаря в формате Unix
   */
  async getInitialData(
    date: string,
    userId: number,
    periodStart: number,
    periodEnd: number,
  ): Promise<IServerResponse<IInitialData>> {
    return await this.postgresService.query(
      'auto-mrsk-get-initial-data',
      'SELECT auto_mrsk.get_initial_data($1, $2, $3, $4)',
      [date, userId, periodStart, periodEnd],
      'get_initial_data',
    );
  }
}
