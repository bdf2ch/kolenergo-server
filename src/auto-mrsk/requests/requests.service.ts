import { Component } from '@nestjs/common';

import * as moment from 'moment';
import * as ical from 'ical-generator';

import { IServerResponse, IUser } from '@kolenergo/core';
import { IRequest, IRequestComment, Request, RequestComment } from '@kolenergo/auto';
import { PostgresService } from '../../common/database/postgres.service';
import { MailService } from '../../common/mail/mail.service';

@Component()
export class RequestsService {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly mail: MailService,
  ) {}

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
      'SELECT auto_mrsk.requests_get($1, $2, $3, $4, $5, $6, $7)',
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
   * Получение оповещений для календаря о заявках со стутусом "Не подтверждена"
   * @param start - Дата и время начала периода в формате Unix
   * @param end - Дата и время окончания периода в формате Unix
   */
  async getNotifications(
    start: number,
    end: number,
  ): Promise<IServerResponse<{date: string, count: number}[]>> {
    console.log('start:', start);
    console.log('end:', end);
    return await this.postgresService.query(
      'auto-mrsk-get-notifications',
      'SELECT auto_mrsk.requests_get_notifications($1, $2)',
      [
        start,
        end,
      ],
      'requests_get_notifications',
    );
  }

  /**
   * Добавление заявки
   * @param request - Добавляемая заявка
   * @param date - Текущая дата
   * @param periodStart - Дата и время начала периода календаря в формате Unix
   * @param periodEnd - Дата и время окончания периода календаря в формате Unix
   */
  async addRequest(
    request: Request,
    date: string,
    periodStart: number,
    periodEnd: number,
    ): Promise<IServerResponse<IRequest[]>> {
    return await this.postgresService.query(
      'auto-mrsk-add-request',
      'SELECT auto_mrsk.requests_add($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
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
        date,
        periodStart,
        periodEnd,
      ],
      'requests_add',
    );
  }

  /**
   * Редактирование заявки
   * @param request - Редактируемая заявка
   * @param periodStart - Дата и время начала периода календаря в формате Unix
   * @param periodEnd - Дата и время окончания периода календаря в формате Unix
   * @param currentDate - Текущая дата
   */
  async editRequest(
    request: Request,
    periodStart: number,
    periodEnd: number,
    currentDate: string,
  ): Promise<IServerResponse<IRequest>> {
    console.log(request);
    const result =  await this.postgresService.query(
      'auto-mrsk-edit-request',
      'SELECT auto_mrsk.requests_edit($1, $2, $3, $4, $5, $6,$7, $8, $9, $10, $11, $12, $13)',
      [
        request.id,
        request.transport ? request.transport.id : null,
        request.driver ? request.driver.id : null,
        request.status.id,
        request.rejectReason ? request.rejectReason.id : null,
        moment(request.startTimeD).format('DD.MM.YYYY'),
        request.startTime,
        request.endTime,
        request.route,
        request.description,
        periodStart,
        periodEnd,
        currentDate,
      ],
      'requests_edit',
    );

    if (request.status.id === 4) {
      const cal = ical({domain: 'mrsksevzap.ru', name: 'Тестовый календарь', method: 'PUBLISH'});
      const event = cal.createEvent({
        start: moment(request.startTime),
        end: moment(request.endTime),
        summary: 'Служебная поездка',
        description: request.description,
        location: request.route[0].title,
        organizer: `${request.user.firstName + ' ' + request.user.lastName} \<${request.user.email}\>`,
        attendees: [{name: `${request.user.firstName} ${request.user.lastName}`, email: request.user.email}],
        url: 'http://sebbo.net/',
      });

      console.log('cal', cal.toString());

      this.mail.send(
        'auto@mrsksevzap.ru',
        request.user.email,
        'Заявка на автостранспорт',
        '',
        {
          method: 'PUBLISH',
          content: cal.toString(),
        },
      );
    }

    return result;
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
