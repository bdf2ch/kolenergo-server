import { Component } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { IAhoRequest, IAhoRequestType } from '@kolenergo/aho-requests';

@Component()
export class AhoRequestsService {
    constructor(private readonly postgresService: PostgresService) {}

    /**
     * Возвращает все типы заявок АХО
     * @returns {Promise<>}
     */
    async getRequestTypes(): Promise<IAhoRequestType> {
        const result = await this.postgresService.query(
            'get-aho-request-types',
            'SELECT * FROM aho_request_types',
            [],
        );
        return result ? result : [];
    }

    async addRequestType(): Promise<IAhoRequestType> {
        return null;
    }
}