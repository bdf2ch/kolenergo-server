import { Component } from '@nestjs/common';
import { PostgresService } from '../database/postgres.service';
import { IUser, IAddUser, IEditUser, IDeleteUser } from '@kolenergo/lib';

@Component()
export class UsersService {
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
   * @param {number} id - Идентфиикатор пользователя
   * @returns {Promise<IUser | null>}
   */
    async getById(id: number): Promise<IUser | null> {
        const result = await this.postgresService.query(
          '',
          `SELECT * FROM users WHERE id = $1`,
          [id],
        );
        return result ? result[0] : null;
    }

  /**
   * Поиск пользователя по учетной записи Active Directory
   * @param {string} account - Учетная запись Active Directory
   * @returns {Promise<IUser | null>}
   */
    async getByAccount(account: string, appCode?: string | null): Promise<IUser | null> {
        console.log(appCode);
        const result = await this.postgresService.query(
          'get-user-by-account',
          `SELECT users_get_by_account($1, $2)`,
          [account, appCode],
            'users_get_by_account',
        );
        return result ? result[0] : null;
    }

  /**
   * Добавление нового пользователя
   * @param {IAddUser} user - Новый пользователь
   * @returns {Promise<IUser | null>}
   */
    async add(user: IAddUser): Promise<IUser | null> {
      const result = await this.postgresService.query(
        'add-user',
        `SELECT users_add($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          user.divisionId,
          user.personalNumber,
          user.firstName,
          user.secondName,
          user.lastName,
          user.position,
          user.email,
          user.activeDirectoryAccount,
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