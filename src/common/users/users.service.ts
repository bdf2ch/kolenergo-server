import { Component } from '@nestjs/common';
import { PostgresService } from '../database/postgres.service';
import { IUser, IAddUser, IEditUser, IDeleteUser } from 'kolenergo';

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
    async getByAccount(account: string): Promise<IUser | null> {
        const result = await this.postgresService.query(
          '',
          `SELECT * FROM users WHERE "activeDirectoryAccount" = $1`,
          [account],
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
        `SELECT user_add($1, $2, $3, $4, $5, $6, $7)`,
        [
          user.divisionId,
          user.firstName,
          user.secondName,
          user.lastName,
          user.position,
          user.email,
          user.activeDirectoryAccount,
        ],
        'user_add',
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
        `SELECT user_edit($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          user.id,
          user.divisionId,
          user.firstName,
          user.secondName,
          user.lastName,
          user.position,
          user.email,
          user.activeDirectoryAccount,
        ],
        'user_edit',
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