import { Component } from '@nestjs/common';

import * as moment from 'moment';
import * as ical from 'ical-generator';

import { IServerResponse, IUser, User } from '@kolenergo/core';
import { IRequest, IRequestComment, Request, RequestComment } from '@kolenergo/auto';
import { PostgresService } from '../../common/database/postgres.service';
import { MailService } from '../../common/mail/mail.service';

@Component()
export class RequestsService {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly mail: MailService,
  ) {
    moment.locale('ru');
  }

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

    const attendees = [{
      name: `${request.user.firstName} ${request.user.lastName}`,
      email: request.user.email,
    }];
    if (request.initiator && request.initiator.hasOwnProperty('id')) {
      attendees.push({
        name: `${(request.initiator as User).firstName} ${(request.initiator as User).lastName}`,
        email: (request.initiator as User).email,
      });
    }
    let routes = '';
    request.route.forEach((route) => {
      routes += `<li>${route.title}</li>`;
    });

    const cal = ical({
      domain: 'mrsksevzap.ru',
      name: 'Заявки на автотранспорт',
      method: 'REQUEST',
    });

    const event = cal.createEvent({
      uid: `auto${request.id}`,
      start: moment(request.startTime),
      end: moment(request.endTime),
      summary: request.description,
      description: request.description,
      location: request.route[0].title,
      transparency: 'opaque',
      organizer: 'Заявки на автотранспорт <auto@mrsksevzap.ru>',
      attendees,
      htmlDescription:
        `<table>
                <tcaption style="width: 100%;">
                    <strong>Заявка #${request.id}</strong>
                </tcaption>
               <tr>
                   <td style="width: 200px; padding-top: 30px; padding-bottom: 5px;">Дата и время:</td>
                   <td style="width: 100%; padding-top: 30px; padding-bottom: 5px;">
                         ${moment(request.startTimeD).format('DD MMMM YYYY, HH:mm')}
                         &mdash;
                         ${moment(request.endTimeD).format('HH:mm')}
                   </td>
               </tr>
               <tr>
                   <td style="width: 200px; padding-bottom: 5px;">О поездке:</td>
                   <td style="width: 100%; padding-bottom: 10px;">${request.description}</td>
               </tr>
               <tr>
                   <td style="width: 200px;padding-bottom: 10px;">Маршрут:</td>
                   <td style="width: 100%; padding-bottom: 10px;">
                       <ul>${routes}</ul>
                   </td>
               </tr>
               <tr>
                   <td style="width: 200px;padding-bottom: 5px;">Транспорт:</td>
                   <td style="width: 100%; padding-bottom: 5px;">
                    <span>${request.transport ? request.transport.model : 'Не назначен'}</span><br>
                    <span><i>${request.transport ? request.transport.registrationNumber : ''}</i></span>
                   </td>
               </tr>
               <tr>
                   <td style="width: 200px;padding-bottom: 5px;">Водитель:</td>
                   <td style="width: 100%; padding-bottom: 5px;">
                    <span>${request.driver ? request.driver.firstName + ' ' + request.driver.lastName : 'Не назначен'}</span><br>
                    <span><i>${request.driver && request.driver.phone ? request.driver.phone : ''}</i></span>
                   </td>
               </tr>
               <tr>
                   <td style="width: 200px;padding-bottom: 5px;">Статус:</td>
                   <td style="width: 100%; padding-bottom: 5px;">
                       ${request.status.title}
                   </td>
               </tr>
            </table><br><br><br>`,
    });

    switch (request.status.id) {
      case 4:
        cal.method('REQUEST');
        event.summary('Служебная поездка');
        break;
      case 3:
        cal.method('CANCEL');
        event.summary('Служебная поездка (отмена)');
        break;
    }

    if (request.status.id === 3 || request.status.id === 4) {
      for (const attendee of attendees) {
        await this.mail.send(
          `Заявки на автотранспорт \<auto@mrsksevzap.ru\>`,
          attendee.email,
          request.description,
          '',
          {
            method: cal.method(),
            content: cal.toString(),
          },
        );
      }
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
