import { Component, InternalServerErrorException } from '@nestjs/common';
import { Pool, PoolClient, QueryResult } from 'pg';
import { environment } from '../../envoirenments';

@Component()
export class PostgresService {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            host: environment.postgresUrl,
            port: 5432,
            database: 'kolenergo',
            user: 'docuser',
            password: 'docasu',
            max: 10,
            idleTimeoutMillis: 30000,
        });

        this.pool.on('error', (error: Error, client: PoolClient) => {
            throw new InternalServerErrorException(error.message);
        });
    }

    query(name: string, text: string, values: any[], func?: string): Promise<any> {
        return new Promise<any>(((resolve, reject) => {
            this.pool.query({name, text, values}, (error: Error, result: QueryResult) => {
                if (error) { reject(error); }
                if ('rows' in result) { console.log(result.rows); }
                resolve('rows' in result ? (func ? result.rows[0][func] : result.rows) : null);
            });
        }));
    }
}