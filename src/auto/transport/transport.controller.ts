import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { ITransport, Transport } from '@kolenergo/auto';
import { TransportService } from './transport.service';

@Controller('auto/transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Get('/')
  async searchTransport(@Query('query') query: string): Promise<IServerResponse<ITransport[]>> {
    return await this.transportService.searchTransport(query);
  }

  @Post('/')
  async addTransport(@Body() transport: Transport): Promise<IServerResponse<ITransport>> {
    return await this.transportService.addTransport(transport);
  }

  @Patch('/:id')
  async editTransport(@Body() transport: Transport): Promise<IServerResponse<ITransport>> {
    return await this.transportService.editTransport(transport);
  }

  @Delete('/:id')
  async removeTransport(transport: Transport): Promise<IServerResponse<boolean>> {
    return await this.transportService.removeTransport(transport);
  }
}
