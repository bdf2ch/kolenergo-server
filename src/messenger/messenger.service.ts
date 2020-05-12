import { Component } from '@nestjs/common';

import { PostgresService } from '../common/database/postgres.service';
import { IServerResponse } from '@kolenergo/core';
import { IApplicationInitialData } from '@kolenergo/messenger';

@Component()
export class MessengerService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Получение данных для инициализации приложения
   * @param userId - Идентификатор пользователя
   * @param messageCount - Количество загружаемых сообщений
   */
  async getInitialData(
    userId: number,
    messageCount: number,
  ): Promise<IServerResponse<IApplicationInitialData>> {
    return await this.postgresService.query(
      'messenger-get-initial-data',
      'SELECT messenger.get_initial_data($1, $2)',
      [
        userId,
        messageCount,
      ],
      'get_initial_data',
    );
  }
}
