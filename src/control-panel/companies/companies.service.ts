import { Component } from '@nestjs/common';
import { PostgresService } from '../../common/database/postgres.service';
import { IServerResponse } from '@kolenergo/lib';
import { IAhoServerResponse } from '@kolenergo/aho';
import { ICompany } from '@kolenergo/cpa';

@Component()
export class CompaniesService {
    constructor(private readonly postgresService: PostgresService) {
    }

    /**
     * Получение списка всех организаций
     * @returns {Promise<>}
     */
    async getCompanies(): Promise<IServerResponse<ICompany[]>> {
        const result = await this.postgresService.query(
            'get-companies',
            `SELECT companies_get_all()`,
            [],
            'companies_get_all',
        );
        return result ? result : null;
    }

    /**
     * Добавление новой роли пользователя
     * @param role - Добавляемая роль пользователя
     */
    /*
    async addRole(role: IRole): Promise<IServerResponse<IRole>> {
        const result = await this.postgresService.query(
            'add-dole',
            'SELECT applications_add_role($1, $2, $3)',
            [
                role.applicationId,
                role.code,
                role.title,
            ],
            'applications_add_role',
        );
        return result ? result : null;
    }
    */



    /**
     * Изменение права пользователя
     * @param permission - Изменяемое право пользователя
     */
    /*
    async editPermission(permission: IPermission): Promise<IServerResponse<IPermission>> {
        const result = await this.postgresService.query(
            'edit-permission',
            `SELECT applications_edit_permission($1, $2, $3)`,
            [
                permission.id,
                permission.code,
                permission.title,
            ],
            'applications_edit_permission',
        );
        return result ? result : null;
    }
    */

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