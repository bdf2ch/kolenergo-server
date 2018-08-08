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
import { IServerResponse, User } from '@kolenergo/lib';

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
     * Получение всех заявок
     * @returns {Promise<IAhoRequest[]>}
     */
    async getRequests(
      start: number,
      end: number,
      employeeId: number,
      requestTypeId: number,
      requestStatusId: number,
      onlyExpired: boolean = false,
      page?: number,
      itemsOnPage?: number,
    ): Promise<IServerResponse<IAhoServerResponse>> {
        const result = await this.postgresService.query(
            'aho-requests-get',
            `SELECT aho_requests_get_all($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              start,
              end,
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
        employeeId: number,
        requestTypeId: number,
        requestStatusId: number,
        ): Promise<string> {
        // this.mailService.send();
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
        sheet.cell(1, 4).string('Кабинет').style(borderedStyle);
        sheet.column(4).setWidth(10);
        sheet.cell(1, 5).string('Содержание').style(borderedStyle);
        sheet.column(5).setWidth(35);
        sheet.cell(1, 6).string('Исполнитель').style(borderedStyle);
        sheet.column(6).setWidth(40);
        sheet.cell(1, 7).string('Статус').style(borderedStyle);
        sheet.column(7).setWidth(15);
        const result = await this.getRequests(start, end, employeeId, requestTypeId, requestStatusId, false, 0, 0);
        console.log(result);
        if (result) {
            let row = 2;
            result.data.requests.forEach((req: IAhoRequest) => {
                sheet
                    .cell(row, 1, row + req.tasks.length - 1, 1, true)
                    .number(req.id)
                    .style(contentStyle)
                    .style(borderedStyle);
                sheet
                    .cell(row, 2, row + req.tasks.length - 1, 2, true)
                    .date(new Date(req.dateCreated))
                    .style(borderedStyle)
                    .style(contentStyle)
                    .style({ numberFormat: 'dd.mm.yyyy' });
                sheet
                    .cell(row, 3, row + req.tasks.length - 1, 3, true)
                    .string(`${req.user.firstName} ${req.user.secondName} ${req.user.lastName}`)
                    .style(contentStyle)
                    .style(borderedStyle);
                sheet
                    .cell(row, 4,  row + req.tasks.length - 1, 4, true)
                    .string(req.room)
                    .style(contentStyle)
                    .style(borderedStyle);
                req.tasks.forEach((task: IAhoRequestTask, index: number) => {
                    sheet
                        .cell(row, 5)
                        .string(`${task.content.title} ${req.type.isCountable ? ' - ' + task.count.toString() : ''}`)
                        .style({border: {bottom: {style: index === req.tasks.length - 1 ? 'thin' : 'none', color: 'black'}}});
                    row++;
                });
                req.employees.forEach((employee: User) => {
                    sheet
                        .cell(row - req.tasks.length, 6, row - 1, 6, true)
                        .string(`${employee.firstName} ${employee.secondName} ${employee.lastName}`)
                        .style(contentStyle)
                        .style(borderedStyle);
                    row++;
                });
                sheet
                    .cell(row - req.employees.length, 7, row - 1, 7, true)
                    .string(req.status.title)
                    .style(contentStyle)
                    .style(borderedStyle);
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
                horizontal: 'left',
                vertical: 'top',
            },
        });
        const request = await  this.getRequestById(requestId);
        console.log(request);
        if (request) {
            let row = 1;
            sheet
                .cell(row, 1, row, 2, true)
                .string(`Заявка ${request.id} от `)
                .style(contentStyle)
                .style(borderedStyle);
            sheet
                .cell(row, 3, row, 4, true)
                .date(new Date(request.dateCreated))
                .style(borderedStyle)
                .style(contentStyle)
                .style({ numberFormat: 'dd.mm.yyyy' });
        }
        return new Promise<string>((resolve, reject) => {
            wb.write(`${requestId}.xlsx`, (err, stats) => {
                if (err) {
                    reject(null);
                }
                const url = path.resolve(`./${requestId}.xlsx`);
                console.log('url', url);
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
            `SELECT aho_requests_add($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                request.user.id,
                request.type.id,
                request.status.id,
                request.room,
                request.numberOfLoaders,
                new Date(request.dateExpires).getTime(),
                request.tasks,
                request.employees,
            ],
            'aho_requests_add',
        );
        return result ? result : null;
    }

    /**
     * Изменение заявки АХО
     * @param {IAhoRequest} request - Заявка АХО
     * @returns {Promise<IAhoRequest | null>}
     */
    async editRequest(request: IAhoRequest): Promise<IAhoRequest | null> {
        let requestStatusId = 3;
        request.tasks.forEach((task: IAhoRequestTask) => {
           if (!task.done) {
               requestStatusId = 2;
           }
        });
        const result = await this.postgresService.query(
            'aho-requests-edit',
            `SELECT aho_requests_edit($1, $2, $3, $4)`,
            [
                request.id,
                requestStatusId,
                request.employees,
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
        return result ? result : null;
    }

    /**
     * Добавление комментария к заявке
     * @param {IAhoRequestComment} comment - Комментарий
     * @returns {Promise<IAhoRequestComment | null>}
     */
    async addComment(comment: IAhoRequestComment): Promise<IAhoRequestComment | null> {
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
}