import { Component } from '@nestjs/common';
import { PostgresService } from '../database/postgres.service';
import { IServerResponse, IUser } from '@kolenergo/core';
import { ICompany } from '@kolenergo/cpa';

@Component()
export class CompaniesService {
  /**
   * Конструктор
   * @param postgresService
   */
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Возвращает всех пользователей
   * @param withDepartments - Включать ли данные о подразделениях организации в ответ
   * @returns {Promise<IServerResponse<ICompany[] | null>>}
   */
  async getAll(withDepartments: boolean): Promise<IServerResponse<ICompany[]> | null> {
    const result = await this.postgresService.query(
      '',
      'SELECT companies_get($1)',
      [withDepartments],
      'companies_get',
    );
    return result ? result : null;
  }
}
