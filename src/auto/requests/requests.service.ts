import { Component } from '@nestjs/common';

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
    periodStart: number,
    periodEnd: number,
    departmentId: number,
    transportTypeId: number,
    statusId: number,
    transportId: number,
    driverId: number,
    userId: number,
    search: string,
  ): Promise<IServerResponse<IRequest[]>> {
    return await this.postgresService.query(
      'auto-get-requests',
      'SELECT auto.requests_get($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        periodStart,
        periodEnd,
        departmentId,
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
  async addRequest(request: Request): Promise<IServerResponse<IRequest>> {
    return await this.postgresService.query(
      'auto-add-request',
      'SELECT auto.requests_add($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        request.department.id,
        request.type.id,
        null,
        null,
        request.user.id,
        request.initiator ? request.initiator.hasOwnProperty('id') ? (request.initiator as IUser).id : null : null,
        request.initiator ? !request.initiator.hasOwnProperty('id') ? request.initiator as string : null : null,
        request.route,
        request.description,
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
      'auto-edit-request',
      'SELECT auto.requests_edit($1, $2, $3, $4, $5, $6,$7, $8, $9)',
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
      'auto-remove-request',
      'SELECT auto.requests_remove($1)',
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
      'auto-add-comment',
      'SELECT auto.comments_add($1, $2, $3)',
      [comment.requestId, comment.user.id, comment.message],
      'comments_add',
    );
  }
}
