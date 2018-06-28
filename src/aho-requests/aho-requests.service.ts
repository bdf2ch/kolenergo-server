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
    IAhoRequestNeed
} from '@kolenergo/aho';
import { IUser } from '@kolenergo/lib';
import * as excel from 'excel4node';

@Component()
export class AhoRequestsService {
    constructor(private readonly postgresService: PostgresService) {}

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
            `SELECT * FROM aho_requests_tasks_content`,
            [],
        );
        return result ? result : [];
    }

    /**
     * Получение всех заявок
     * @returns {Promise<IAhoRequest[]>}
     */
    async getRequests(): Promise<IAhoRequest[]> {
        const result = await this.postgresService.query(
            'get-aho-requests',
            `SELECT aho_requests_get_all()`,
            [],
            'aho_requests_get_all',
        );
        return result ? result : [];
    }

    /**
     * Получение заявки по идентификатору
     * @param {number} id - Идентификатор заявки
     * @returns {Promise<IAhoRequest | null>}
     */
    async getRequestById(id: number): Promise<IAhoRequest | null> {
        const result = this.postgresService.query(
            'get-request-by-id',
            `SELECT aho_requests_get_by_id($1)`,
            [id],
            'aho_requests_get_by_id',
        );
        return result ? result : null;
    }

    /**
     * Получение заявок по идентфикатору статуса
     * @param {number} id - Идентификатор статуса заявки
     * @returns {Promise<IAhoRequest[]>}
     */
    async getRequestsByStatusId(id: number): Promise<IAhoRequest[]> {
        const result = this.postgresService.query(
            'get-requests-by-status',
            `SELECT aho_requests_get_by_status_id($1)`,
            [id],
            'aho_requests_get_by_status_id',
        );
        return result ? result : [];
    }

    /**
     * Полученеи заявок по идентфиикатору исполнителя
     * @param {number} id - Идентификатор исполнителя
     * @returns {Promise<IAhoRequest[]>}
     */
    async getRequestsByEmployeeId(id: number): Promise<IAhoRequest[]> {
        const result = this.postgresService.query(
            'get-requests-by-employee',
            `SELECT aho_requests_get_by_employee_id($1)`,
            [id],
            'aho_requests_get_by_employee_id',
        );
        return result ? result : [];
    }

    /**
     * Добавление новой заявки
     * @param {IAddAhoRequest} request - Новая заявка
     * @returns {Promise<IAhoRequest | null>}
     */
    async addRequest(request: IAddAhoRequest): Promise<IAhoRequest | null> {
        const result = await this.postgresService.query(
            'add-aho-request',
            `SELECT aho_requests_add($1, $2, $3, $4, $5, $6)`,
            [
                request.user.id,
                request.type.id,
                request.status.id,
                request.comment,
                request.room,
                request.tasks,
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
        const result = await this.postgresService.query(
            'edit-aho-request',
            `SELECT aho_requests_edit($1, $2, $3, $4)`,
            [
                request.id,
                request.status.id,
                request.employee ? request.employee.id : 0,
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
            'delete-request',
            `SELECT aho_requests_delete($1)`,
            [requestId],
            'aho_requests_delete',
        );
        return result;
    }

    /**
     * Добавление комментария к заявке
     * @param {IAhoRequestComment} comment - Комментарий
     * @returns {Promise<IAhoRequestComment | null>}
     */
    async addComment(comment: IAhoRequestComment): Promise<IAhoRequestComment | null> {
        const result = await this.postgresService.query(
            'add-aho-request-comment',
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
        let wb = new excel.Workbook();
        let sheet = wb.addWorksheet('Потребность в материалах');
        await wb.write('export.xlsx');
        const url = path.resolve('./export.xlsx');
        return url;
    }
}