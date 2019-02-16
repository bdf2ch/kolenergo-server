import { Component } from '@nestjs/common';
import { PostgresService } from '../../common/database/postgres.service';
import { ICompany, IDepartment, IOffice, IOfficeLocation, IDivision, IServerResponse } from '@kolenergo/cpa';

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
     * Добавление нового подразделдения организации
     * @param department - Добавляемое подразделение
     */
    async addDepartment(department: IDepartment): Promise<IServerResponse<IDepartment>> {
        const result = await this.postgresService.query(
            'add-department',
            'SELECT companies_departments_add($1, $2, $3)',
            [
                department.companyId,
                department.title,
                department.activeDirectoryUid,
            ],
            'companies_departments_add',
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
            'SELECT companies_offices_add($1, $2, $3, $4, $5, $6, $7, $8)',
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
            'companies_offices_add',
        );
        return result ? result : null;
    }

    /**
     * Добавление нового помещения офиса организации
     * @param location - Добавляемое помещение
     */
    async addLocation(location: IOfficeLocation): Promise<IServerResponse<IOfficeLocation>> {
        const result = await this.postgresService.query(
            'add-location',
            'SELECT companies_locations_add($1, $2, $3, $4, $5, $6)',
            [
                location.companyId,
                location.departmentId,
                location.officeId,
                location.floor,
                location.title,
                location.description,
            ],
            'companies_locations_add',
        );
        return result ? result : null;
    }

    /**
     * Изменение организации
     * @param company - Изменяемая организация
     */
    async editCompany(company: ICompany): Promise<IServerResponse<ICompany>> {
        const result = await this.postgresService.query(
            'edit-company',
            `SELECT companies_edit($1, $2, $3, $4)`,
            [
                company.id,
                company.title,
                company.shortTitle,
                company.activeDirectoryUid,
            ],
            'companies_edit',
        );
        return result ? result : null;
    }

    /**
     * Изменение подразделения организации
     * @param department - Изменяемое подразделение организации
     */
    async editDepartment(department: IDepartment): Promise<IServerResponse<IDepartment>> {
        const result = await this.postgresService.query(
            'edit-department',
            `SELECT companies_departments_edit($1, $2, $3)`,
            [
                department.id,
                department.title,
                department.activeDirectoryUid,
            ],
            'companies_departments_edit',
        );
        return result ? result : null;
    }

    /**
     * Изменение здания организации
     * @param office - Изменяемое здание организации
     */
    async editOffice(office: IOffice): Promise<IServerResponse<IOffice>> {
        const result = await this.postgresService.query(
            'edit-office',
            `SELECT companies_offices_edit($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                office.id,
                office.departmentId,
                office.title,
                office.description,
                office.address,
                office.floors,
                office.isWithLoft,
                office.isWithBasement,
            ],
            'companies_offices_edit',
        );
        return result ? result : null;
    }

    /**
     * Изменение помещения
     * @param location - Изменяемое помещение
     */
    async editLocation(location: IOfficeLocation): Promise<IServerResponse<IOfficeLocation>> {
        const result = await this.postgresService.query(
            'edit-location',
            `SELECT companies_locations_edit($1, $2, $3)`,
            [
                location.id,
                location.title,
                location.description,
            ],
            'companies_locations_edit',
        );
        return result ? result : null;
    }

    /**
     * Удваление орагнизации
     * @param companyId - Идентификатор удаляемой организации
     */
    async deleteCompany(companyId: number): Promise<IServerResponse<boolean>> {
        const result = this.postgresService.query(
            'delete-company',
            'SELECT companies_delete($1)',
            [companyId],
            'companies_delete',
        );
        return result ? result : null;
    }

    /**
     * Удаление подразделения орагнизации
     * @param departmentId - Идентификатор удаляемого подразделения организаци
     */
    async deleteDepartment(departmentId: number): Promise<IServerResponse<boolean>> {
        const result = this.postgresService.query(
            'delete-department',
            'SELECT companies_departments_delete($1)',
            [departmentId],
            'companies_departments_delete',
        );
        return result ? result : null;
    }

    /**
     * Удваление помещения орагнизации
     * @param officeId - Удаляемое структурне подразделение
     */
    async deleteOffice(officeId: number): Promise<IServerResponse<boolean>> {
        const result = this.postgresService.query(
            'delete-office',
            'SELECT companies_offices_delete($1)',
            [officeId],
            'companies_offices_delete',
        );
        return result ? result : null;
    }

    /**
     * Удваление помещения в здании орагнизации
     * @param locationId - Идентификатор удаляемого помещения в здании организации
     */
    async deleteLocation(locationId: number): Promise<IServerResponse<boolean>> {
        const result = this.postgresService.query(
            'delete-location',
            'SELECT companies_locations_delete($1)',
            [locationId],
            'companies_locations_delete',
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