import { Component } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { IAhoRequest, IAhoRequestType, IAddAhoRequest } from '@kolenergo/aho';

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

    async addRequestType(): Promise<IAhoRequestType> {
        return null;
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
     * Добавление новой заявки
     * @param {IAddAhoRequest} request - Новая заявка
     * @returns {Promise<IAhoRequest | null>}
     */
    async addRequest(request: IAddAhoRequest): Promise<IAhoRequest | null> {
        const result = await this.postgresService.query(
            'add-aho-request',
            `SELECT aho_requests_add($1, $2, $3, $4)`,
            [
                request.userId,
                request.requestTypeId,
                request.comment,
                request.room,
            ],
            'aho_requests_add',
        );
        return result ? result : null;
    }
}