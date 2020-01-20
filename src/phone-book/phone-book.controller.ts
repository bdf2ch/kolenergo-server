import { Controller, Post, Get, Body, Param, Query, Delete, Patch, Req } from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { IInitialData} from '@kolenergo/phones';
import { PhoneBookService } from './phone-book.service';

@Controller('phones')
export class PhoneBookController {
  constructor(private readonly phoneBookService: PhoneBookService) {}

  @Get('')
  async getInitialData(@Req() request): Promise<IServerResponse<IInitialData>> {
    console.log('SESSION USER', request.user);
    const result = await this.phoneBookService.getInitialData();
    result.data.user = request.user;
    return result;
  }
}
