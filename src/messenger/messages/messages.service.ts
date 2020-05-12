import { Component } from '@nestjs/common';
import { PostgresService } from '../../common/database/postgres.service';

import { IServerResponse } from '@kolenergo/core';
import { IMessage, Chat } from '@kolenergo/messenger';
import moment = require('moment');

@Component()
export class MessagesService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Получение сообщений беседы
   * @param chat - Беседа, сообщения которой требуется получить
   * @param startMessageId - Идентификатор начальноо сообщения
   * @param messageCount - Количество сообщений
   */
  async getByChat(
    chat: Chat,
    startMessageId: number,
    messageCount: number,
  ): Promise<IServerResponse<IMessage[]>> {
    return await this.postgresService.query(
      'messenger-messages-get-by-chat',
      'SELECT messenger.message_get_by_chat_id($1, $2, $3)',
      [
        chat.id,
        startMessageId,
        messageCount,
      ],
      'message_get_by_chat_id',
    );
  }
}
