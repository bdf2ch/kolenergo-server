import { Component } from '@nestjs/common';
import { PostgresService } from '../../common/database/postgres.service';
import { IServerResponse, IPermission, IRole, IUser } from '@kolenergo/core';
import { Application, IApplication } from '@kolenergo/cpa';



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
   * Добавление нового приложения
   */
  async addApplication(application: Application): Promise<IServerResponse<IApplication>> {
    const result = await this.postgresService.query(
      'control-applications-add',
      `SELECT control.applications_add($1, $2, $3, $4, $5)`,
      [
        application.title,
        application.description,
        application.code,
        application.icon,
        application.color,
      ],
      'applications_add',
    );
    return result ? result : null;
  }

  /**
   * Получение информации о приложении по идентификатору
   * @param applicationId - Идентификатор приложения
   */
  async getById(applicationId: number): Promise<IServerResponse<IApplication>> {
    const result = await this.postgresService.query(
      'control-applications-get-by-id',
      `SELECT control.applications_get_by_id($1)`,
      [applicationId],
      'applications_get_by_id',
    );
    return result ? result : null;
  }

  /**
   * Получение списка пользователей, имеющих доступ к приложению
   * @param appCode - Код приложения
   */
  async getApplicationAllowedUsers(appCode: string): Promise<IServerResponse<IUser[]>> {
    const result = await this.postgresService.query(
      'get-application-allowed-users',
      'SELECT applications_get_allowed_users($1)',
      [
        appCode,
      ],
      'applications_get_allowed_users',
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
      'SELECT applications_add_role($1, $2, $3, $4)',
      [
        role.applicationId,
        role.code,
        role.title,
          role.permissions,
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
      `SELECT applications_edit_role($1, $2, $3, $4)`,
      [
        role.id,
        role.code,
        role.title,
          role.permissions,
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
