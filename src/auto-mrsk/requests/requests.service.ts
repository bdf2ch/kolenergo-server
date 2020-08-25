import { Component } from '@nestjs/common';

import * as moment from 'moment';

import { IServerResponse, IUser } from '@kolenergo/core';
import { IRequest, IRequestComment, Request, RequestComment } from '@kolenergo/auto';
import { PostgresService } from '../../common/database/postgres.service';

@Component()
export class RequestsService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Получение заявок
   * @param periodStart - Начало периода
   * @param periodEnd - Окончание периода
   * @param departmentId - Идентфиикатор подразделения организации
   * @param transportTypeId - Идентификатор типа транспорта
   * @param statusId - Идентификатор статуса заявки
   * @param transportId - Идентификатор транспортного средства
   * @param driverId - Идентификатор водителя
   * @param userId - Идентификатор пользователя, разместившего заявку
   * @param search - Условие поиска
   */
  async getRequests(
    // periodStart: number,
    // periodEnd: number,
    // departmentId: number,
    date: string,
    transportTypeId: number,
    statusId: number,
    transportId: number,
    driverId: number,
    userId: number,
    search: string,
  ): Promise<IServerResponse<IRequest[]>> {
    return await this.postgresService.query(
      'auto-mrsk-get-requests',
      'SELECT auto-mrsk.requests_get($1, $2, $3, $4, $5, $6, $7)',
      [
        // periodStart,
        // periodEnd,
        // departmentId,
        date,
        transportTypeId,
        statusId,
        transportId,
        driverId,
        userId,
        search,
      ],
      'requests_get',
    );
  }

  /**
   * Добавление заявки
   * @param request - Добавляемая заявка
   */
  async addRequest(request: Request): Promise<IServerResponse<IRequest[]>> {
    return await this.postgresService.query(
      'auto-mrsk-add-request',
      'SELECT auto_mrsk.requests_add($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [
        // request.department.id,
        1, // request.type.id,
        null,
        null,
        request.user.id,
        request.initiator ? request.initiator.hasOwnProperty('id') ? (request.initiator as IUser).id : null : null,
        request.initiator ? !request.initiator.hasOwnProperty('id') ? request.initiator as string : null : null,
        moment(request.startTime).format('DD.MM.YYYY'),
        request.startTime,
        request.endTime,
        request.route,
        request.description,
        moment().format('DD.MM.YYYY'),
      ],
      'requests_add',
    );
  }

  /**
   * Редактирование заявки
   * @param request - Редактируемая заявка
   */
  async editRequest(request: Request): Promise<IServerResponse<IRequest>> {
    return await this.postgresService.query(
      'auto-mrsk-edit-request',
      'SELECT auto-mrsk.requests_edit($1, $2, $3, $4, $5, $6,$7, $8, $9)',
      [
        request.id,
        request.transport ? request.transport.id : null,
        request.driver ? request.driver.id : null,
        request.status.id,
        request.rejectReason ? request.rejectReason.id : null,
        request.startTime,
        request.endTime,
        request.route,
        request.description,
      ],
      'requests_edit',
    );
  }

  /**
   * Удаление заявки
   * @param request - Удаляемая заявка
   */
  async removeRequest(request: Request): Promise<IServerResponse<boolean>> {
    return await this.postgresService.query(
      'auto-mrsk-remove-request',
      'SELECT auto-mrsk.requests_remove($1)',
      [request.id],
      'requests_remove',
    );
  }

  /**
   * Добавление комментария к заявке
   * @param comment - Добавляемый комментарий
   */
  async addComment(comment: RequestComment): Promise<IServerResponse<IRequestComment>> {
    return await this.postgresService.query(
      'auto-mrsk-add-comment',
      'SELECT auto-mrsk.comments_add($1, $2, $3)',
      [comment.requestId, comment.user.id, comment.message],
      'comments_add',
    );
  }
}
