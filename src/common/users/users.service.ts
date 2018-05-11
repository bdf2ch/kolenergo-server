import { Component } from '@nestjs/common';
import { PostgresService } from '../database/postgres.service';

@Component()
export class UsersService {
    constructor(private readonly postgresService: PostgresService) {}

    async findAll(): Promise<any> {
        return null;
    }

    async addUser(): Promise<any> {
        return null;
    }

    async getAll(): Promise<any> {
        const result = await this.postgresService.query('', 'SELECT * FROM users', []);
        return result;
    }

    async getById(id: number): Promise<any> {
        const user = await this.postgresService.query('', 'SELECT * FROM users WHERE id = $1', [id]);
        return user[0] ? user[0] : null;
    }
}