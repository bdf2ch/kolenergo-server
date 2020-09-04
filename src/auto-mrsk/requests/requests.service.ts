import { Component } from '@nestjs/common';

import * as path from 'path';
import * as moment from 'moment';
import * as ical from 'ical-generator';
import * as excel from 'excel4node';

import { IServerResponse, IUser, User } from '@kolenergo/core';
import { IRequest, IRequestComment, Request, RequestComment, IRoutePoint } from '@kolenergo/auto';
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
    periodStart: number,
    periodEnd: number,
    // departmentId: number,
    // date: string,
    transportTypeId: number,
    statusId: number,
    transportId: number,
    driverId: number,
    userId: number,
    search: string,
  ): Promise<IServerResponse<IRequest[]>> {
    return await this.postgresService.query(
      'auto-mrsk-get-requests',
      'SELECT auto_mrsk.requests_get($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        periodStart,
        periodEnd,
        // departmentId,
        // date,
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
   * @param userId - Идентификатор пользователя
   * @param start - Дата и время начала периода в формате Unix
   * @param end - Дата и время окончания периода в формате Unix
   */
  async getNotifications(
    userId: number,
    start: number,
    end: number,
  ): Promise<IServerResponse<{date: string, count: number}[]>> {
    return await this.postgresService.query(
      'auto-mrsk-get-notifications',
      'SELECT auto_mrsk.requests_get_notifications($1, $2, $3)',
      [
        userId,
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
    const result: IServerResponse<{
      request: IRequest,
      requests: IRequest[],
      userRequests: IRequest[],
      calendarRequests: {date: string, count: number}[],
      routes: IRoutePoint[],
    }> = await this.postgresService.query(
      'auto-mrsk-add-request',
      'SELECT auto_mrsk.requests_add($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
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
        moment(date).startOf('day').unix() * 1000,
        moment(date).endOf('day').unix() * 1000,
        periodStart,
        periodEnd,
      ],
      'requests_add',
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
    if (request.driver && request.driver.email) {
      attendees.push({
        name: `${request.driver.firstName} ${request.driver.lastName}`,
        email: request.driver.email,
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

    cal.createEvent({
      uid: `auto${result.data.request.id}`,
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
                    <strong>Заявка #${result.data.request.id}</strong>
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
                       ${result.data.request.status.title}
                   </td>
               </tr>
            </table><br><br><br>`,
    });

    for (const attendee of attendees) {
      this.mail.send(
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

    return result;
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
    currentDate: Date,
  ): Promise<IServerResponse<IRequest>> {
    const result =  await this.postgresService.query(
      'auto-mrsk-edit-request',
      'SELECT auto_mrsk.requests_edit($1, $2, $3, $4, $5, $6,$7, $8, $9, $10, $11, $12, $13, $14)',
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
        moment(currentDate).startOf('day').unix() * 1000,
        moment(currentDate).endOf('day').unix() * 1000,
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
    if (request.driver && request.driver.email) {
      attendees.push({
        name: `${request.driver.firstName} ${request.driver.lastName}`,
        email: request.driver.email,
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
        break;
      case 3:
        cal.method('CANCEL');
        break;
    }

    if (request.status.id === 3 || request.status.id === 4) {
      for (const attendee of attendees) {
        this.mail.send(
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

  async export(
    periodStart: number,
    periodEnd: number,
    statusId: number,
    transportId: number,
    driverId: number,
    userId: number,
    search: string,
  ): Promise<string> {
    const wb = new excel.Workbook();
    const sheet = wb.addWorksheet('Заявки на автотранспорт', {
      pageSetup: {
        orientation: 'landscape',
        scale: 55,
      },
    });
    const border = {
      style: 'thin',
      color: 'black',
    };
    const contentStyle = wb.createStyle({
      border: {
        left: border,
        top: border,
        right: border,
        bottom: border,
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true,
      },
      font: {
        size: 12,
      },
    });
    const headerStyle = wb.createStyle({
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: 'f5f5f5',
      },
      border: {
        left: border,
        top: border,
        right: border,
        bottom: border,
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true,
      },
      font: {
        size: 12,
      },
    });
    const titleStyle = wb.createStyle({
      alignment: {
        horizontal: 'left',
        vertical: 'center',
      },
      font: {
        size: 18,
      },
    });

    let row = 1;
    sheet.column(1).setWidth(7);
    sheet.column(2).setWidth(7);     // # заявки
    sheet.column(3).setWidth(30);    // Инициатор / заказчик
    sheet.column(4).setWidth(30);    // Дата / подробности
    sheet.column(5).setWidth(30);    // Маршрут
    sheet.column(6).setWidth(25);    // Транспорт
    sheet.column(7).setWidth(25);    // Водитель
    sheet.column(8).setWidth(20);    // Статус

    row++;
    const requests = await this.getRequests(periodStart, periodEnd, 0, statusId, transportId, driverId, userId, search);
    const start = periodStart !== 0 ? moment(periodStart) : moment(requests.data[0].startTime);
    const end = periodEnd !== 0 ? moment(periodEnd) : moment(requests.data[requests.data.length - 1].startTime);
    sheet.row(row).setHeight(30);
    sheet
      .cell(row, 2)
      .string('Заявки на автотранспорт ' + `${moment(start).isSame(end, 'day')
        ? 'на ' + moment(start).format('DD MMMM YYYY')
        : 'c ' + start.format('DD') + ' по ' + end.format('DD MMMM YYYY')}`)
      .style(titleStyle);

    row++;
    sheet.row(row).setHeight(45);
    sheet.cell(row, 2, row, 2, true).string('#').style(headerStyle);
    sheet.cell(row, 3, row, 3, true).string('Инициатор / заказчик').style(headerStyle);
    sheet.cell(row, 4, row, 4, true).string('Дата поездки / подробности').style(headerStyle);
    sheet.cell(row, 5, row, 5, true).string('Маршрут').style(headerStyle);
    sheet.cell(row, 6, row, 6, true).string('Транспорт').style(headerStyle);
    sheet.cell(row, 7, row, 7, true).string('Водитель').style(headerStyle);
    sheet.cell(row, 8, row, 8, true).string('Статус').style(headerStyle);

    row++;

    requests.data.forEach((request: IRequest, index: number, reqs: IRequest[]) => {
      const height = request.route.length > 2 ? request.route.length : 2;

      /**
       * # Заявки
       */
      sheet.row(row).setHeight(25);
      sheet.row(row + 1).setHeight(25);
      sheet.cell(row, 2, row + height - 1, 2, true).number(request.id).style(contentStyle);

      /**
       * Инициатор / заказчик
       */
      if (request.initiator) {
        sheet
          .cell(row, 3, row + height - 1, 3, true)
          .string(request.initiator.hasOwnProperty('id')
            ? `${(request.initiator as IUser).firstName} ${(request.initiator as IUser).lastName}\n${request.user.firstName} ${request.user.lastName}`
            : request.initiator as string)
          .style(contentStyle);
      } else {
        sheet.cell(row, 3, row + height - 1, 3, true).string(`${request.user.firstName} ${request.user.lastName}`).style(contentStyle);
      }

      /**
       * Дата и время поездки / подробности о поездке
       */
      sheet.row(row).setHeight(25);
      sheet
        .cell(row, 4, row, 4)
        .string(`${moment(request.startTime).format('DD MMM YYYY, HH:mm')} - ${moment(request.endTime).format('HH:mm')}`)
        .style({
          border: {top: {style: 'thin'}, bottom: {style: 'none'}},
          font: {size: 12},
          alignment: {horizontal: 'center', vertical: 'center', wrapText: true},
        });

      sheet
        .cell(row + 1, 4, row + height - 1, 4, true)
        .string([request.description, {bold: false, underline: false, italics: false, color: '757575', size: 12, value: ''}])
        .style({
          border: {top: {style: 'none'}, bottom: {style: 'thin'}},
          font: {size: 12, color: '757575'},
          alignment: {horizontal: 'center', vertical: 'center', wrapText: true},
        });

      /**
       * Маршрут
       */
      request.route.forEach((route: IRoutePoint, i: number, routes: IRoutePoint[]) => {
        sheet.row(row + i).setHeight(25);
        sheet
          .cell(row + i, 5, row + i, 5)
          .string(route.title)
          .style({
            border: {
              top: {style: i === 0 ? 'thin' : 'none'},
              bottom: {style: i === routes.length - 1 ? 'thin' : 'none'},
              left: {style: 'thin'},
            },
            font: {size: 12},
            alignment: {horizontal: 'center', vertical: 'center', wrapText: true},
        });
      });

      /**
       * Транспорт
       */
      const transport = [
        request.transport ? `${request.transport.model}` : 'Не назначен',
        {
          bold: false,
          underline: false,
          italics: false,
          color: '9e9e9e',
          size: 12,
          value: request.transport ? '\n' + request.transport.registrationNumber : '',
        },
      ];
      sheet
        .cell(row, 6, row + height - 1, 6, true)
        .string(transport)
        .style(contentStyle);

      /**
       * Водитель
       */
      const driver = [
        request.driver ? `${request.driver.firstName} ${request.driver.lastName}` : 'Не назначен',
        {
          bold: false,
          underline: false,
          italics: false,
          color: '9e9e9e',
          size: 12,
          value: request.driver && request.driver.phone ? '\n' + request.driver.phone : '',
        },
      ];
      sheet
        .cell(row, 7, row + height - 1, 7, true)
        .string(driver)
        .style(contentStyle);

      /**
       * Статус заявки
       */
      sheet
        .cell(row, 8, row + height - 1, 8, true)
        .string(request.status.title)
        .style(contentStyle);

      row += height;
    });

    return new Promise<string>((resolve, reject) => {
      wb.write('auto.xlsx', (err, stats) => {
        if (err) {
          reject(null);
        }
        const url = path.resolve('./auto.xlsx');
        resolve(url);
      });
    });
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
