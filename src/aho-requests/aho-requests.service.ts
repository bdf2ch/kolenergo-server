import * as path from 'path';
import { Component } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import {
    IAhoRequest,
    IAhoRequestType,
    IAddAhoRequest,
    IAhoRequestStatus,
    IAhoRequestTaskContent,
    IAhoRequestComment,
    IAhoRequestNeed, IAhoRequestTask, IAhoRequestRejectReason, IAhoRequestsInitialData, IAhoServerResponse,
} from '@kolenergo/aho';
import * as excel from 'excel4node';
import { MailService } from '../common/mail/mail.service';
import { IServerResponse, IUser, User } from '@kolenergo/lib';

@Component()
export class AhoRequestsService {
    constructor(private readonly postgresService: PostgresService,
                private readonly mailService: MailService) {}

    /**
     * Получение все типов заявок АХО
     * @returns {Promise<>}
     */
    async getRequestTypes(): Promise<IAhoRequestType[]> {
        const result = await this.postgresService.query(
            'get-aho-request-types',
            `SELECT * FROM aho_requests_types ORDER BY "order"`,
            [],
        );
        return result ? result : [];
    }

    /**
     * Получение данных для инициализации приложения
     * @param userId - Идентификатор пользователя
     * @param itemsOnPage - Количество заявок на странице
     */
    async getInitialData(userId: number, itemsOnPage: number): Promise<IServerResponse<IAhoServerResponse>> {
        const result = await this.postgresService.query(
            'aho-requests-get-initial-data',
            `SELECT aho_requests_get_initial_data($1, $2)`,
            [userId, itemsOnPage],
            'aho_requests_get_initial_data',
        );
        return result;
    }

    /**
     * Получение всех статусов заявок АХО
     * @returns {Promise<IAhoRequestStatus[]>}
     */
    async getRequestStatuses(): Promise<IAhoRequestStatus[]> {
        const result = this.postgresService.query(
            'get-aho-request-statuses',
            `SELECT * FROM aho_requests_statuses`,
            [],
        );
        return result ? result : [];
    }

    /**
     * Получение статуса заявки АХО по идентификатору
     * @param id - Идентификатор статуса
     * @returns {Promise<IAhoRequestStatus | null>}
     */
    async getRequestStatusById(id: number): Promise<IAhoRequestStatus | null> {
        const result = this.postgresService.query(
            'aho-requests-get-status-by-id',
            `SELECT * FROM aho_requests_statuses WHERE id = $1`,
            [id],
        );
        return result ? result : null;
    }

    /**
     * Получение всего содержимого задач заявки АХО
     * @returns {Promise<IAhoRequestTaskContent[]>}
     */
    async getRequestTasksContent(): Promise<IAhoRequestTaskContent[]> {
        const result = this.postgresService.query(
            'get-aho-requests-tasks-content',
            `SELECT * FROM aho_requests_tasks_content ORDER BY title ASC`,
            [],
        );
        return result ? result : [];
    }

    /**
     * Получение списка причин отклонения заявок
     * @returns {Promise<IAhoRequestRejectReason[]>}
     */
    async getRequestRejectReasons(): Promise<IAhoRequestRejectReason[]> {
        const result = await this.postgresService.query(
            'get-aho-request-reject-reasons',
            'SELECT * FROM aho_requests_reject_reasons',
            [],
        );
        return result ? result : [];
    }


    /**
     * Добавление причины отклоенния заявки
     * @param rejectReason
     * @returns {Promise<IAhoRequestRejectReason | null>}
     */
    async addRejectReason(rejectReason: IAhoRequestRejectReason): Promise<IAhoRequestRejectReason | null> {
        const result = await this.postgresService.query(
            'aho-requests-reject-reason-add',
            `SELECT aho_requests_reject_reason_add($1, $2)`,
            [rejectReason.requestTypeId, rejectReason.content],
            'aho_requests_reject_reason_add',
        );
        return result ? result : null;
    }

    /**
     * Получение всех заявок
     * @returns {Promise<IAhoRequest[]>}
     */
    async getRequests(
      start: number,
      end: number,
      userId: number,
      employeeId: number,
      requestTypeId: number,
      requestStatusId: number,
      onlyExpired: boolean = false,
      page?: number,
      itemsOnPage?: number,
    ): Promise<IServerResponse<IAhoServerResponse>> {
        const result = await this.postgresService.query(
            'aho-requests-get',
            `SELECT aho_requests_get_all($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              start,
              end,
              userId,
              employeeId,
              requestTypeId,
                requestStatusId,
                onlyExpired,
                page,
                itemsOnPage,
            ],
            'aho_requests_get_all',
        );
        return result;
    }

    /**
     * Получение общего количества заявок
     */
    async getRequestsCount(): Promise<number> {
        const result = await this.postgresService.query(
            'aho-requests-get-count',
            'SELECT aho_requests_get_count()',
            [],
            'aho_requests_get_count',
        );
        return result ? result : 0;
    }

    /**
     * Поиск заявок АХО
     * @param {string} query - Условие поиска
     * @returns {Promise<IAhoRequest[]>}
     */
    async searchRequests(query: string): Promise<IServerResponse<IAhoServerResponse>> {
        const result = this.postgresService.query(
            'aho-requests-search',
            `SELECT aho_requests_search($1)`,
            [query],
            'aho_requests_search',
        );
        return result ? result : [];
    }

    /**
     * Экспорт заявок АХО в Excel
     * @param {number} start - Дата начала периода
     * @param {number} end - Дата окончания периода
     * @param {number} employeeId - Идентификатор исполнителя
     * @param {number} requestTypeId - Идентификатор типа заявки
     * @param {number} requestStatusId - Идентификатор статуса заявки
     * @returns {Promise<string>}
     */
    async exportRequests(
        start: number,
        end: number,
        userId: number,
        employeeId: number,
        requestTypeId: number,
        requestStatusId: number,
        ): Promise<string> {
        const wb = new excel.Workbook();
        const sheet = wb.addWorksheet('Заявки АХО');
        const border = {
            style: 'thin',
            color: 'black',
        };
        const borderedStyle = wb.createStyle({
            border: {
                left: border,
                top: border,
                right: border,
                bottom: border,
            },
        });
        const contentStyle = wb.createStyle({
            alignment: {
                horizontal: 'left',
                vertical: 'top',
            },
        });
        sheet.row(1).setHeight(20);
        sheet.cell(1, 1).string('#').style(borderedStyle);
        sheet.column(1).setWidth(5);
        sheet.cell(1, 2).string('Дата подачи').style(borderedStyle);
        sheet.column(2).setWidth(15);
        sheet.cell(1, 3).string('Заявитель').style(borderedStyle);
        sheet.column(3).setWidth(40);
        sheet.cell(1, 4).string('Срок исполн.').style(borderedStyle);
        sheet.column(4).setWidth(15);
        sheet.cell(1, 5).string('Кабинет').style(borderedStyle);
        sheet.column(5).setWidth(10);
        sheet.cell(1, 6).string('Содержание').style(borderedStyle);
        sheet.column(6).setWidth(35);
        sheet.cell(1, 7).string('Исполнители').style(borderedStyle);
        sheet.column(7).setWidth(40);
        sheet.cell(1, 8).string('Статус').style(borderedStyle);
        sheet.column(8).setWidth(15);
        const result = await this.getRequests(start, end, userId, employeeId, requestTypeId, requestStatusId, false, 0, 0);
        if (result) {
            let row = 2;
            result.data.requests.forEach((req: IAhoRequest) => {
                const max = req.numberOfLoaders
                    ? Math.max(req.tasks.length, req.employees.length)
                    : Math.max(req.tasks.length, req.employees.length) - 1;
                sheet
                    .cell(row, 1, row + max, 1, true)
                    .number(req.id)
                    .style(contentStyle)
                    .style(borderedStyle);
                sheet
                    .cell(row, 2, row + max, 2, true)
                    .date(new Date(req.dateCreated))
                    .style(borderedStyle)
                    .style(contentStyle)
                    .style({ numberFormat: 'dd.mm.yyyy' });
                sheet
                    .cell(row, 3, row + max, 3, true)
                    .string(`${req.user.firstName} ${req.user.secondName} ${req.user.lastName}`.replace('  ', ''))
                    .style(contentStyle)
                    .style(borderedStyle);
                if (req.dateExpires) {
                    sheet
                        .cell(row, 4, row + max, 4, true)
                        .date(new Date(req.dateExpires))
                        .style(borderedStyle)
                        .style(contentStyle)
                        .style({ numberFormat: 'dd.mm.yyyy' });
                } else {
                    sheet
                        .cell(row, 4)
                        .string('Не задан')
                        .style(contentStyle)
                        .style({
                            font: {
                                color: '757575',
                            },
                        });
                }
                sheet
                    .cell(row + max, 4)
                    .style({
                        border: {
                            bottom: {
                                style: 'thin',
                                color: 'black',
                            },
                        },
                    });
                sheet
                    .cell(row, 5,  row + max, 5, true)
                    .string(req.room)
                    .style(contentStyle)
                    .style(borderedStyle);
                req.tasks.forEach((task: IAhoRequestTask, index: number) => {
                    sheet
                        .cell(row + index, 6)
                        .string(`${task.content.title} ${req.type.isCountable && task.count ? ' - ' + task.count.toString() + (task.content.boxing ? ' ' + task.content.boxing : ' штук') : ''}`)
                        .style({border: {bottom: {style: index === max ? 'thin' : 'none', color: 'black'}, right: {style: 'thin', color: 'black'}}});
                });
                if (req.numberOfLoaders) {
                    sheet
                        .cell(row + max, 6)
                        .string(`Требуется грузчиков - ${req.numberOfLoaders} человек`)
                        .style({
                            font: {
                                color: '424242',
                            },
                            border: {
                                bottom: {
                                    style: 'thin',
                                    color: 'black',
                                },
                                right: {
                                    style: 'thin',
                                    color: 'black',
                                },
                            },
                        });
                }
                if (req.employees.length > 0) {
                    req.employees.forEach((employee: IUser, index: number) => {
                        sheet
                            .cell(row + index, 7)
                            .string(`${employee.firstName} ${employee.secondName} ${employee.lastName}`.replace('  ', ''))
                            .style(contentStyle)
                            .style({
                                border: {
                                    top: {
                                        style: index === 0 ? 'thin' : 'none',
                                        color: 'black',
                                    },
                                },
                            });
                    });
                } else {
                    sheet
                        .cell(row, 7)
                        .string('Не назначены')
                        .style(contentStyle)
                        .style({
                            font: {
                                color: '757575',
                            },
                        });
                }
                sheet
                    .cell(row + max, 7)
                    .style({
                        border: {
                            bottom: {
                                style: 'thin',
                                color: 'black',
                            },
                        },
                    });
                sheet
                    .cell(row, 8, row + max, 8, true)
                    .string(req.status.title)
                    .style(contentStyle)
                    .style(borderedStyle);
                row += max + 1;
            });
        }
        await wb.write('aho.xlsx');
        const url = path.resolve('./aho.xlsx');
        return url;
    }

    /**
     * Экспорт заявки АХО в Excel
     * @param requestId - Идентификатор заявки
     */
    async exportRequest(requestId: number): Promise<string> {
        const wb = new excel.Workbook();
        const sheet = wb.addWorksheet('Заявка #' + requestId);
        const border = {
            style: 'thin',
            color: 'black',
        };
        const borderedStyle = wb.createStyle({
            border: {
                left: border,
                top: border,
                right: border,
                bottom: border,
            },
        });
        const contentStyle = wb.createStyle({
            alignment: {
                horizontal: 'center',
                vertical: 'center',
            },
        });
        const headerStyle = wb.createStyle({
            alignment: {
                horizontal: 'left',
                vertical: 'center',
            },
            font: {
                size: 25,
            },
        });
        const request = await  this.getRequestById(requestId);
        if (request) {
            sheet.column(1).setWidth(30);
            sheet.column(2).setWidth(60);
            let row = 1;

            /**
             * Заголовок
             */
            sheet
                .row(row)
                .setHeight(40);
            sheet
              .cell(row, 1, row, 2, true)
              .string(`Заявка #${request.id}`)
              .style(headerStyle);
            row++;

            /**
             * Дата подачи заявки
             */
            sheet
                .cell(row, 1, row + 1, 1, true)
                .string('Дата подачи заявки')
                .style(borderedStyle)
                .style(contentStyle);
            sheet
                .cell(row, 2, row + 1, 2, true)
                .date(new Date(request.dateCreated))
                .style(borderedStyle)
                .style(contentStyle)
                .style({ numberFormat: 'dd.mm.yyyy, HH:mm' });
            row += 2;

            /**
             * Заявитель
             */
            sheet
                .cell(row, 1, row + 1, 1, true)
                .string('Заявитель')
                .style(contentStyle)
                .style(borderedStyle);
            sheet
                .cell(row, 2, row + 1, 2, true)
                .string(`${request.user.firstName} ${request.user.secondName} ${request.user.lastName}`.replace('  ', ''))
                .style(borderedStyle)
                .style(contentStyle);
            row += 2;

            /**
             * Категория заявки
             */
            sheet
                .cell(row, 1, row + 1, 1, true)
                .string('Категория заявки')
                .style(contentStyle)
                .style(borderedStyle);
            sheet
                .cell(row, 2, row + 1, 2, true)
                .string(`${request.type.title}`)
                .style(borderedStyle)
                .style(contentStyle);
            row += 2;

            /**
             * Содержание заявки
             */
            sheet
                .cell(row, 1, request.tasks.length === 1 ? row + 1 : row + request.tasks.length - 1, 1, true)
                .string('Содержание заявки')
                .style(borderedStyle)
                .style(contentStyle);
            request.tasks.forEach((task: IAhoRequestTask, index: number) => {
                sheet
                    .cell(row + index, 2, request.tasks.length === 1 ? row + 1 : row + index, 2, true)
                    .string(
                        `${task.content.title}${request.type.isCountable && task.count
                        ? ' - ' + task.count + ' ' + (task.content.boxing ? task.content.boxing : 'штук')
                        : ''}`)
                    .style({border: {right: {style: 'thin', color: 'black'}}})
                    .style(contentStyle);
            });
            row += request.tasks.length > 2 ? request.tasks.length : 2;

            /**
             * Срок исполнения заявки
             */
            if (request.dateExpires) {
                sheet
                    .cell(row, 1, row + 1, 1, true)
                    .string('Срок исполнения')
                    .style(contentStyle)
                    .style(borderedStyle);
                sheet
                    .cell(row, 2, row + 1, 2, true)
                    .date(new Date(request.dateExpires))
                    .style(borderedStyle)
                    .style(contentStyle)
                    .style({ numberFormat: 'dd.mm.yyyy' });
                row += 2;
            }

            /**
             * Кабинет
             */
            if (request.room) {
                sheet
                    .cell(row, 1, row + 1, 1, true)
                    .string('Кабинет')
                    .style(contentStyle)
                    .style(borderedStyle);
                sheet
                    .cell(row, 2, row + 1, 2, true)
                    .string(request.room)
                    .style(borderedStyle)
                    .style(contentStyle);
                row += 2;
            }

            /**
             * Количество грузчиков
             */
            if (request.numberOfLoaders) {
                sheet
                    .cell(row, 1, row + 1, 1, true)
                    .string('Количество грузчиков')
                    .style(contentStyle)
                    .style(borderedStyle);
                sheet
                    .cell(row, 2, row + 1, 2, true)
                    .number(request.numberOfLoaders)
                    .style(borderedStyle)
                    .style(contentStyle);
                row += 2;
            }

            /**
             * Исполнители заявки
             */
            sheet
                .cell(row, 1, request.employees.length === 1 || request.employees.length === 0
                    ? row + 1
                    : row + request.employees.length - 1, 1, true)
                .string('Исполнители')
                .style(borderedStyle)
                .style(contentStyle);
            if (request.employees.length > 1) {
                request.employees.forEach((employee: IUser, index: number, array: IUser[]) => {
                    sheet
                        .cell(row + index, 2)
                        .string(`${employee.firstName} ${employee.secondName} ${employee.lastName}`.replace('  ', ''))
                        .style({
                            border: {
                                right: {
                                    style: 'thin',
                                    color: 'black',
                                },
                                bottom: {
                                    style: index === array.length - 1 ? 'thin' : 'none',
                                    color: 'black',
                                },
                            },
                        })
                        .style(contentStyle);
                });
            } else if (request.employees.length === 1) {
                sheet
                    .cell(row, 2, row + 1, 2, true)
                    .string(`${request.employees[0].firstName} ${request.employees[0].secondName} ${request.employees[0].lastName}`.replace('  ', ''))
                    .style(borderedStyle)
                    .style(contentStyle);
            } else {
                sheet
                    .cell(row, 2, row + 1, 2, true)
                    .string('Не назначены')
                    .style(borderedStyle)
                    .style(contentStyle);
            }
            row += request.employees.length > 2 ? request.employees.length : 2;

            /**
             * Статус заявки
             */
            sheet
                .cell(row, 1, row + 1, 1, true)
                .string('Статус заявки')
                .style(contentStyle)
                .style(borderedStyle);
            sheet
                .cell(row, 2, row + 1, 2, true)
                .string(request.status.title)
                .style(borderedStyle)
                .style(contentStyle);
            row += 2;

            /**
             * Причина отклонения заячки
             */
            if (request.rejectReason) {
                sheet
                    .cell(row, 1, row + 1, 1, true)
                    .string('Причина отклонения заявки')
                    .style(contentStyle)
                    .style(borderedStyle);
                sheet
                    .cell(row, 2, row + 1, 2, true)
                    .string(request.rejectReason.content)
                    .style(borderedStyle)
                    .style(contentStyle);
            }
        }
        return new Promise<string>((resolve, reject) => {
            wb.write(`${requestId}.xlsx`, (err, stats) => {
                if (err) {
                    reject(null);
                }
                const url = path.resolve(`./${requestId}.xlsx`);
                resolve(url);
            });
        });
    }

    /**
     * Получение заявки по идентификатору
     * @param {number} id - Идентификатор заявки
     * @returns {Promise<IAhoRequest | null>}
     */
    async getRequestById(id: number): Promise<IAhoRequest | null> {
        const result = this.postgresService.query(
            'aho-requests-get-by-id',
            `SELECT aho_requests_get_by_id($1)`,
            [id],
            'aho_requests_get_by_id',
        );
        return result ? result : null;
    }

  /**
   * Добавление новой заявки
   * @param {IAddAhoRequest} request - Новая заявка
   * @returns {Promise<IAhoRequest | null>}
   */
  async addRequest(request: IAddAhoRequest): Promise<IAhoRequest | null> {
    const result = await this.postgresService.query(
      'aho-requests-add',
      `SELECT aho_requests_add($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        request.user.id,
        request.type.id,
        request.status.id,
        request.room,
        request.numberOfLoaders,
        new Date(request.dateExpires).getTime(),
        request.tasks,
        request.employees,
        request.initiator,
      ],
      'aho_requests_add',
    );
    if (request.user.email) {
      this.mailService.send(
        'Заявки АХО <aho@kolenergo.ru>',
        request.user.email,
        `Заявка №${result.id} принята`,
        `Ваша заявка принята.` +
        `<br><a href="http://10.50.0.153:12345/request/${result.id}">Открыть заявку в системе заявок АХО</a>`,
      );
    }
    const administrators = await this.getAdministrators();
    administrators.forEach((user: IUser) => {
      if (request.user.email) {
        let tasks = '<ul style="margin-top: 0px; margin-bottom: 0px;">';
        request.tasks.forEach((task: IAhoRequestTask, index: number) => {
          tasks += `<li>${task.content.title} ${request.type.isCountable
              ? ' - ' + task.count + ' ' + (task.content.boxing ? task.content.boxing : 'штук')
              : ''}</li>`;
        });
        tasks += '</ul>';
        this.mailService.send(
          'Заявки АХО <aho@kolenergo.ru>',
          request.user.email,
          `Новая заявка №${result.id}`,
          `Новая заявка №${result.id}.<br><br>` +
          `Категория заявки: ${request.type.title}<br>` +
          `${request.initiator ? 'Инициатор: ' + request.initiator + '<br>' : ''}` +
          `Заявитель: ${request.user.firstName} ${request.user.secondName ? request.user.secondName : ''} ${request.user.lastName}<br>` +
          `${request.room ? 'Кабинет: ' + request.room + '<br>' : ''}` +
          `${request.numberOfLoaders ? 'Количество грузчиков: ' + request.numberOfLoaders + '<br>' : ''}` +
          `${request.dateExpires ? 'Срок исполнения: ' +
            new Date(request.dateExpires).getDate() + '.' +
            (new Date(request.dateExpires).getMonth() + 1) + '.' +
            new Date(request.dateExpires).getFullYear() + '<br>' : ''}` +
          `Содержимое заявки:<br>` + tasks +
          `<br><a href="http://10.50.0.153:12345/request/${result.id}">Открыть заявку в системе заявок АХО</a>`,
        );
      }
    });
    return result ? result : null;
  }

  /**
   * Изменение заявки АХО
   * @param {IAhoRequest} request - Заявка АХО
   * @returns {Promise<IAhoRequest | null>}
   */
  async editRequest(request: IAhoRequest): Promise<IAhoRequest | null> {
    const request_ = await this.getRequestById(request.id);
    request.employees.forEach((employee: IUser) => {
      const findEmployeeById = (user: IUser) => user.id === employee.id;
      const user = request_.employees.find(findEmployeeById);
      if (!user && employee.email) {
        this.mailService.send(
          'Заявки АХО <aho@kolenergo.ru>',
          employee.email,
          `Вы назначены исполнителем заявки №${request.id}`,
          `Вы назначены исполнителем заявки №${request.id}.` +
          `<br><a href="http://10.50.0.153:12345/request/${request.id}">Открыть заявку в системе заявок АХО</a>`,
        );
      }
    });
    if (request.dateExpires && request.dateExpires !== request_.dateExpires) {
        request.employees.forEach((employee: IUser) => {
            if (employee.email) {
                this.mailService.send(
                    'Заявки АХО <aho@kolenergo.ru>',
                    employee.email,
                    `У заявки №${request.id} изменен срок исполнения`,
                    `У заявки №${request.id} изменен срок исполенния, новый срок исполнения:` +
                    `${new Date(request.dateExpires).getDate() +
                    '.' + (new Date(request.dateExpires).getMonth() + 1) +
                    '.' + new Date(request.dateExpires).getFullYear()}` +
                    `<br><a href="http://10.50.0.153:12345/request/${request.id}">Открыть заявку в системе заявок АХО</a>`,
                );
            }
        });
    }

    let requestStatusId = 3;
    request.tasks.forEach((task: IAhoRequestTask) => {
      if (!task.done) {
        requestStatusId = 2;
      }
    });
    if (request_.status.id !== requestStatusId) {
      if (request.user.email) {
        const status = await this.getRequestStatusById(requestStatusId);
        this.mailService.send(
          'Заявки АХО <aho@kolenergo.ru>',
          request.user.email,
          `Статус Вашей заявки №${request.id} изменен: ${status[0].title}`,
          `Статус Вашей заявки №${request.id} изменен: ${status[0].title}` +
          `<br><a href="http://10.50.0.153:12345/request/${request.id}">Открыть заявку в системе заявок АХО</a>`,
        );
      }
    }
    const result = await this.postgresService.query(
      'aho-requests-edit',
      `SELECT aho_requests_edit($1, $2, $3, $4, $5)`,
      [
        request.id,
        requestStatusId,
        request.employees,
        new Date(request.dateExpires).getTime(),
        request.tasks,
      ],
      'aho_requests_edit',
    );
    return result ? result : null;
  }

  /**
   * Удаление заявки АХО
   * @param {number} requestId - Идентификатор заявки
   * @returns {Promise<boolean>}
   */
  async deleteRequest(requestId: number): Promise<boolean> {
    const result = await this.postgresService.query(
      'aho-requests-delete',
      `SELECT aho_requests_delete($1)`,
      [requestId],
      'aho_requests_delete',
    );
    return result;
  }

  /**
   * Отклонение заявки АХО
   * @param {IAhoRequest} request - Заявка АХО
   * @returns {Promise<IAhoRequest | null>}
   */
  async rejectRequest(request: IAhoRequest): Promise<IAhoRequest | null> {
    const result = this.postgresService.query(
      'aho-requests-reject',
      `SELECT aho_requests_reject($1, $2)`,
      [request.id, request.rejectReason.id],
      'aho_requests_reject',
    );
    if (request.user.email) {
      this.mailService.send(
        'Заявки АХО <aho@kolenergo.ru>',
        request.user.email,
        `Ваша заявка №${request.id} отклонена`,
        `Ваша заявка №${request.id} отклонена.` +
        `<br> Причина отклонения заявки: ${request.rejectReason.content}.` +
        `<br><a href="http://10.50.0.153:12345/request/${request.id}">Открыть заявку в системе заявок АХО</a>`,
      );
    }
    return result ? result : null;
  }

  /**
   * Возобновление заявки АХО
   * @param request (IAhoRequest) - Заявка АХО
   */
  async resumeRequest(request: IAhoRequest): Promise<IAhoRequest | null> {
    const result = await this.postgresService.query(
      'aho-requests-resume',
      `SELECT aho_requests_resume($1)`,
      [request.id],
      'aho_requests_resume',
    );
    if (request.user.email) {
      this.mailService.send(
        'Заявки АХО <aho@kolenergo.ru>',
        request.user.email,
        `Ваша заявка №${request.id} возобновлена`,
        `Ваша заявка №${request.id} возобновлена.` +
        `<br><a href="http://10.50.0.153:12345/request/${request.id}">Открыть заявку в системе заявок АХО</a>`,
      );
    }
    return result ? result : null;
  }

  /**
   * Отмена заявки АХО
   * @param {IAhoRequest} request - Заявка АХО
   * @returns {Promise<IAhoRequest | null>}
   */
  async cancelRequest(request: IAhoRequest): Promise<IAhoRequest | null> {
    const result = this.postgresService.query(
      'aho-requests-cancel',
      `SELECT aho_requests_cancel($1)`,
      [request.id],
      'aho_requests_cancel',
    );
    if (request.user.email) {
      this.mailService.send(
        'Заявки АХО <aho@kolenergo.ru>',
        request.user.email,
        `Ваша заявка №${request.id} отменена`,
        `Ваша заявка №${request.id} отменена.` +
        `<br><a href="http://10.50.0.153:12345/request/${request.id}">Открыть заявку в системе заявок АХО</a>`,
      );
    }
    request.employees.forEach((employee: IUser) => {
        if (employee.email) {
            this.mailService.send(
                'Заявки АХО <aho@kolenergo.ru>',
                employee.email,
                `Заявка №${request.id} отменена заявителем`,
                `Заявка №${request.id} отменена заявителем.` +
                `<br><a href="http://10.50.0.153:12345/request/${request.id}">Открыть заявку в системе заявок АХО</a>`,
            );
        }
    });
    const administrators = await this.getAdministrators();
    administrators.forEach((user: IUser) => {
        if (user.email) {
          this.mailService.send(
            'Заявки АХО <aho@kolenergo.ru>',
            user.email,
            `Заявка №${request.id} отменена заявителем`,
            `Заявка №${request.id} отменена заявителем.` +
            `<br><a href="http://10.50.0.153:12345/request/${request.id}">Открыть заявку в системе заявок АХО</a>`,
          );
        }
    });
    return result ? result : null;
  }

  /**
   * Добавление комментария к заявке
   * @param {IAhoRequestComment} comment - Комментарий
   * @returns {Promise<IAhoRequestComment | null>}
   */
  async addComment(comment: IAhoRequestComment): Promise<IAhoRequestComment | null> {
    const request_ = await this.getRequestById(comment.requestId);
    const result = await this.postgresService.query(
      'aho-requests-add-comment',
      `SELECT aho_requests_comments_add($1, $2, $3)`,
      [
        comment.requestId,
        comment.userId,
        comment.content,
      ],
      'aho_requests_comments_add',
    );
    if (comment.userId !== request_.user.id && request_.user.email) {
      this.mailService.send(
        'Заявки АХО <aho@kolenergo.ru>',
        request_.user.email,
        `К Вашей заявки №${request_.id} добавлен комментарий`,
        `К Вашей заявки №${request_.id} добавлен комментарий:<br><i>${comment.content}</i>` +
        `<br><a href="http://10.50.0.153:12345/request/${request_.id}">Открыть заявку в системе заявок АХО</a>`,
      );
    }
    return result;
  }

  /**
   * Получение потребностей в материалах
   * @returns {Promise<IAhoRequestNeed>}
   */
  async getNeeds(): Promise<IAhoRequestNeed[]> {
    const result = this.postgresService.query(
      'aho-requests-get-needs',
      `SELECT aho_requests_tasks_content_get_needs()`,
      [],
      'aho_requests_tasks_content_get_needs',
    );
    return result ? result : [];
  }

  /**
   * Получение выгрузки потребностей в материалах
   * @returns {Promise<string>}
   */
  async exportNeeds(): Promise<string> {
    const wb = new excel.Workbook();
    const sheet = wb.addWorksheet('Потребность в материалах');
    const needs = await this.getNeeds();
    if (needs) {
      const now = new Date();
      const headerStyle = wb.createStyle({
        font: {
          size: 18,
          bold: true,
        },
        alignment: {
          vertical: 'center',
        },
      });
      const border = {
        style: 'thin',
        color: 'black',
      };
      const borderedStyle = wb.createStyle({
        border: {
          left: border,
          top: border,
          right: border,
          bottom: border,
        },
      });
      sheet
        .cell(1, 1, 1, 3, true)
        .string(`Потребность в материалах на ${now.getDate() < 10
          ? '0' + now.getDate().toString() : now.getDate()}.${(now.getMonth() + 1) < 10
          ? '0' + (now.getMonth() + 1).toString() : (now.getMonth() + 1).toString()}.${now.getFullYear()}`)
        .style(headerStyle);
      sheet.row(1).setHeight(40);
      sheet.column(1).setWidth(5);
      sheet.column(2).setWidth(50);
      sheet.column(3).setWidth(15);
      sheet.cell(2, 1).string('#').style(borderedStyle);
      sheet.cell(2, 2).string('Наименование').style(borderedStyle);
      sheet.cell(2, 3).string('Количество').style(borderedStyle);
      needs.forEach((item: IAhoRequestNeed, index: number) => {
        sheet.cell(index + 3, 1).number(index + 1).style(borderedStyle);
        sheet.cell(index + 3, 2).string(item.content.title).style(borderedStyle);
        sheet.cell(index + 3, 3).string(`${item.total} ${item.content.boxing ? item.content.boxing : 'штук'}`).style(borderedStyle);
      });
    }
    await wb.write('needs.xlsx');
    const url = path.resolve('./needs.xlsx');
    return url;
  }

  /**
   * Получение списка администраторов приложения
   */
  async getAdministrators(): Promise<IUser[]> {
      const result = this.postgresService.query(
        'aho-requests-get-administrators',
        `SELECT users_get_by_role_id(1)`,
        [],
          'users_get_by_role_id',
      );
      return result ? result : [];
    }
}