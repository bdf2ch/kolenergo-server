import { Component } from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { IAutoRequestsInitialData } from '@kolenergo/auto';
import { PostgresService } from '../common/database/postgres.service';

@Component()
export class AutoService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Получение данных для инициализации приложения
   * @param startTime - Время начала периода
   * @param endTime - Время окончания периода
   * @param departmentId - Идентификатор подразделения организации
   * @param userId - Идентификатор пользователя
   */
  async getInitialData(
    startTime: number,
    endTime: number,
    departmentId: number,
    userId: number,
  ): Promise<IServerResponse<IAutoRequestsInitialData>> {
    return await this.postgresService.query(
      'auto-get-initial-data',
      'SELECT auto.init_application($1, $2, $3, $4)',
      [
        startTime,
        endTime,
        departmentId,
        userId,
      ],
      'init_application',
    );
  }
}
