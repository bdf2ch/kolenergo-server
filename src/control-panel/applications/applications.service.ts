import { Component } from '@nestjs/common';
import { PostgresService } from '../../common/database/postgres.service';
import { IServerResponse } from '@kolenergo/lib';
import { IAhoServerResponse } from '@kolenergo/aho';
import { IApplication } from '@kolenergo/cp';

@Component()
export class ApplicationsService {
    constructor(private readonly postgresService: PostgresService) {}

    /**
     * Получение списка всех приложений
     * @returns {Promise<>}
     */
    async getApplications(): Promise<IServerResponse<IApplication[]>> {
        const result = await this.postgresService.query(
            'get-applications',
            `SELECT applications_get_all()`,
            [],
            'applications_get_all',
        );
        return result ? result : null;
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
}