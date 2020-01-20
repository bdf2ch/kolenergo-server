import { Component } from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { ITransport, Transport } from '@kolenergo/auto';
import { PostgresService } from '../../common/database/postgres.service';

@Component()
export class TransportService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Добавление транспортного средства
   * @param transport - Добавляемое странспортное средство
   */
  async addTransport(transport: Transport): Promise<IServerResponse<ITransport>> {
    return await this.postgresService.query(
      'auto-add-transport',
      'SELECT auto.transport_add($1, $2, $3, $4, $5)',
      [
        transport.department.id,
        transport.type.id,
        transport.registrationNumber,
        transport.model,
        transport.description,
      ],
      'transport_add',
    );
  }

  /**
   * Редактирование транспортного средства
   * @param transport - Редактируемое транспортное средство
   */
  async editTransport(transport: Transport): Promise<IServerResponse<ITransport>> {
    return await this.postgresService.query(
      'auto-edit-transport',
      'SELECT auto.transport_edit($1, $2, $3, $4, $5, $6)',
      [
        transport.id,
        transport.department.id,
        transport.type.id,
        transport.registrationNumber,
        transport.model,
        transport.description,
      ],
      'transport_edit',
    );
  }

  /**
   * Удаление транспортного средства
   * @param transport - Удаляемое транспортное средство
   */
  async removeTransport(transport: Transport): Promise<IServerResponse<boolean>> {
    return await this.postgresService.query(
      'auto-remove-transport',
      'SELECT auto.transport_remove($1)',
      [transport.id],
      'transport_remove',
    );
  }

  /**
   * Поиск транспортного средства
   * @param query - Условие поиска
   */
  async searchTransport(query: string): Promise<IServerResponse<ITransport[]>> {
    return await this.postgresService.query(
      'auto-search-transport',
      'SELECT auto.transport_search($1)',
      [query],
      'transport_search',
    );
  }
}
