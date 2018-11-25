import { Component } from '@nestjs/common';
import { PostgresService } from '../../common/database/postgres.service';
import { IPermission, IRole, IServerResponse } from '@kolenergo/lib';
import { IAhoServerResponse } from '@kolenergo/aho';
import { IApplication } from '@kolenergo/cp';

@Component()
export class ApplicationsService {
  constructor(private readonly postgresService: PostgresService) {
  }

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
   * Добавление новой роли пользователя
   * @param role - Добавляемая роль пользователя
   */
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

  /**
   * Изменение роли пользователя
   * @param role - Изменяемая роль пользователя
   */
  async editRole(role: IRole): Promise<IServerResponse<IRole>> {
    const result = await this.postgresService.query(
      'edit-role',
      `SELECT applications_edit_role($1, $2, $3)`,
      [
        role.id,
        role.code,
        role.title,
      ],
      'applications_edit_role',
    );
    return result ? result : null;
  }

  /**
   * Добавление нового права пользователя
   * @param permission - Добавляемое право пользователя
   */
  async addPermission(permission: IPermission): Promise<IServerResponse<IPermission>> {
    const result = await this.postgresService.query(
      'add-permission',
      'SELECT applications_add_permission($1, $2, $3)',
      [
        permission.applicationId,
        permission.code,
        permission.title,
      ],
      'applications_add_permission',
    );
    return result ? result : null;
  }

  /**
   * Изменение права пользователя
   * @param permission - Изменяемое право пользователя
   */
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