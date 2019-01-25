import { Component } from '@nestjs/common';
import { PostgresService } from '../../common/database/postgres.service';
import { ICompany, IOffice, IDivision, IServerResponse } from '@kolenergo/cpa';

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
     * Добавление новой организации
     * @param company - Добавляемая организация
     */
    async addCompany(company: ICompany): Promise<IServerResponse<ICompany>> {
        const result = await this.postgresService.query(
            'add-company',
            'SELECT companies_add($1, $2, $3)',
            [
                company.title,
                company.shortTitle,
                company.activeDirectoryUid,
            ],
            'companies_add',
        );
        return result ? result : null;
    }

    /**
     * Добавление нового офиса организации
     * @param office - Добавляемый офис организации
     */
    async addOffice(office: IOffice): Promise<IServerResponse<IOffice>> {
        const result = await this.postgresService.query(
            'add-office',
            'SELECT companies_add_office($1, $2, $3, $4, $5, $6, $7, $8)',
            [
                office.companyId,
                office.departmentId,
                office.title,
                office.description,
                office.address,
                office.floors,
                office.isWithLoft,
                office.isWithBasement,
            ],
            'companies_add_office',
        );
        return result ? result : null;
    }

    /**
     * Добавление нового структурного подразделения организации
     * @param division - Добавляемое структурное подразделение
     */
    async addDivision(division: IDivision): Promise<IServerResponse<IDivision>> {
        const result = await this.postgresService.query(
            'add-division',
            'SELECT companies_divisions_add($1, $2, $3, $4)',
            [
                division.companyId,
                division.parentId,
                division.title,
                division.order,
            ],
            'companies_divisions_add',
        );
        return result ? result : null;
    }

    /**
     * Изменение структурного подразделения
     * @param division - Изменяемое структурное подразделение
     */
    async editDivision(division: IDivision): Promise<IServerResponse<IDivision>> {
        const result = await this.postgresService.query(
            'edit-division',
            `SELECT companies_divisions_edit($1, $2, $3, $4)`,
            [
                division.id,
                division.parentId,
                division.title,
                division.order,
            ],
            'companies_divisions_edit',
        );
        return result ? result : null;
    }

    /**
     * Удваление структурного подразделения орагнизации
     * @param division - Удаляемое структурне подразделение
     */
    async deleteDivision(divisionId: number): Promise<IServerResponse<boolean>> {
        const result = this.postgresService.query(
            'delete-division',
            'SELECT companies_divisions_delete($1)',
            [divisionId],
            'companies_divisions_delete',
        );
        return result ? result : null;
    }
}