import { Component } from '@nestjs/common';
import { PostgresService } from '../database/postgres.service';
import { IUser, IAddUser, IEditUser, IDeleteUser } from '@kolenergo/lib';

@Component()
export class UsersService {
  /**
   * Конструктор
   * @param postgresService
   */
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Возвращает всех пользователей
   * @returns {Promise<IUser[] | null>}
   */
  async getAll(): Promise<IUser[] | null> {
    const result = await this.postgresService.query(
      '',
      'SELECT * FROM users',
      [],
    );
    return result ? result : null;
  }

  /**
   * Поиск пользователя по идентификатору
   * @param {Number} id - Идентфиикатор пользователя
   * @param {String} appCode - Код приложения
   * @returns {Promise<IUser | null>}
   */
  async getById(id: number, appCode?: string | null): Promise<IUser | null> {
    const result = await this.postgresService.query(
      'get-user-by-id',
      `SELECT users_get_by_id($1, $2)`,
      [id, appCode],
      'users_get_by_id',
    );
    return result ? result : null;
  }

  /**
   * Поиск пользователя по учетной записи Active Directory
   * @param {String} account - Учетная запись Active Directory
   * @param {String} appCode - Код приложения
   * @returns {Promise<IUser | null>}
   */
  async getByAccount(account: string, appCode?: string | null): Promise<IUser | null> {
    const result = await this.postgresService.query(
      'get-user-by-account',
      `SELECT users_get_by_account($1, $2)`,
      [account, appCode],
      'users_get_by_account',
    );
    return result ? result : null;
  }

  /**
   * Получение пользователей, задействованных в приложении
   * @param {string} appCode
   * @returns {Promise<IUser[]>}
   */
  async getByAppCode(appCode: string): Promise<IUser[]> {
    const result = this.postgresService.query(
      'get-app-users',
      `SELECT users_get_by_application_code($1)`,
      [appCode],
      'users_get_by_application_code',
    );
    return result ? result : [];
  }

  /**
   * Добавление нового пользователя
   * @param {IAddUser} user - Новый пользователь
   * @returns {Promise<IUser | null>}
   */
  async add(user: IAddUser): Promise<IUser | null> {
    const result = await this.postgresService.query(
      'add-user',
      `SELECT users_add($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        user.divisionId,
        user.personalNumber,
        user.firstName,
        user.secondName,
        user.lastName,
        user.position,
        user.email,
        user.activeDirectoryAccount,
        user.activeDirectoryCompanyUid,
        user.activeDirectoryDepartmentUid,
      ],
      'users_add',
    );
    return result ? result : null;
  }

  /**
   * Редактирование пользователя
   * @param {IEditUser} user - Редактируемый пользователь
   * @returns {Promise<IUser | null>}
   */
  async edit(user: IEditUser): Promise<IUser | null> {
    const result = await this.postgresService.query(
      'edit-user',
      `SELECT user_edit($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        user.id,
        user.divisionId,
        user.personalNumber,
        user.firstName,
        user.secondName,
        user.lastName,
        user.position,
        user.email,
        user.activeDirectoryAccount,
      ],
      'users_edit',
    );
    return result ? result : null;
  }

  /**
   * Удаление пользователя
   * @param {IDeleteUser} user
   * @returns {Promise<boolean>}
   */
  async delete(user: IDeleteUser): Promise<boolean> {
    const result = await this.postgresService.query(
      'delete-user',
      `SELECT user_delete($1, $2)`,
      [user.id],
      'user_delete',
    );
    return result;
  }
}