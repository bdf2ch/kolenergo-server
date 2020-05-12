import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';

import { MessengerActionTypes, Chat, IMessage } from '@kolenergo/messenger';
import { MessagesService } from './messages.service';
import { IServerResponse } from '@kolenergo/cpa';

@WebSocketGateway()
export class MessagesGatewayComponent implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('test')
  onEvent(client, data): WsResponse<any> {
    console.log('event', data);
    const event = 'events';
    return { event, data };
  }

  @SubscribeMessage(MessengerActionTypes.LOAD_CHAT)
  async onLoadChatEvent(
    client,
    data: {chat: Chat, startMessageId: number, messageCount: number},
  ): Promise<WsResponse<IServerResponse<IMessage[]>>> {
    console.log('load chat event');
    const result = await this.messagesService.getByChat(data.chat, data.startMessageId, data.messageCount);
    return { event: MessengerActionTypes.LOAD_CHAT_SUCCESS, data: result };
  }

  afterInit(server: any): any {
    console.log('WebSocket init', server);
  }

  handleConnection(client: any): any {
    console.log('WebSocket connect');
    this.server.emit('connect');
  }

  handleDisconnect(client: any): any {
    console.log('WebSocket disconnect');
  }
}
