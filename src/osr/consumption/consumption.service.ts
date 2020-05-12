import { Component } from '@nestjs/common';
import { PostgresService } from '../../common/database/postgres.service';

import { IServerResponse } from '@kolenergo/core';
import moment = require('moment');

@Component()
export class ConsumptionService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Добавление отчета о максимальном потреблении за прошедшие сутки
   * @param companyId - Идентификатор организации
   * @param divisionId - Идентификатор структурного подразделения
   * @param userId - Идентификатор пользователя
   * @param consumption - Добавляемый отчет об максимальном потреблении за прошедшие сутки
   */
  async add(
    companyId: number,
    divisionId: number,
    userId: number,
    consumption: number,
  ): Promise<IServerResponse<number>> {
    const date = moment();
    return await this.postgresService.query(
      'osr-add-consumption',
      `SELECT osr.consumption_add($1, $2, $3, $4, $5)`,
      [
        companyId,
        divisionId,
        userId,
        date.format('DD.MM.YYYY'),
        consumption,
      ],
      'consumption_add',
    );
  }
}
