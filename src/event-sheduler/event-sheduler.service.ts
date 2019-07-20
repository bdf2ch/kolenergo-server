import { Component } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { IServerResponse, IUser } from '@kolenergo/core';
import { IEventShedulerInitialData, IEventRequest } from '@kolenergo/esa';
import moment = require('moment');

@Component()
export class EventShedulerService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Получение данных для инициализации приложения
   * @param userId - Идентификатор пользователя
   * @param start - Время начала периода в формате Unix
   * @param end - Время окончания периода в формате Unix
   */
  async getInitialData(userId: number, start: number, end: number): Promise<IServerResponse<IEventShedulerInitialData>> {
    const result = await this.postgresService.query(
      'esa-get-initial-data',
      `SELECT esa.get_initial_data($1, $2, $3)`,
      [userId, start, end],
      'get_initial_data',
    );
    return result ? result : null;
  }

  /**
   * Добавление завяки на мероприятие
   * @param request - Добавляемая заявка
   */
  async addRequest(request: IEventRequest): Promise<IServerResponse<IEventRequest>> {
    const result = await this.postgresService.query(
      'esa-add-request',
      'SELECT esa.add_request($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)',
      [
        request.type.id,
        request.interval.id,
        request.user.id,
        request.host && request.host.hasOwnProperty('id') ? (request.host as IUser).id : null,
        request.host ? request.host : null,
        request.companies,
        request.departments,
        request.subject,
        request.description,
        request.date,
        request.startTime,
        request.endTime,
        request.needProjector,
        request.needBoard,
        request.numberOfParticipants,
        request.participants,
      ],
      'add_request',
    );
    return result ? result : null;
  }
}
