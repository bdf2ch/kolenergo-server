import { Controller, Post, Get, Body, Param, Query, Delete, Patch} from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { IPortalInitialData} from '@kolenergo/portal';
import { PortalService } from './portal.service';

@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('')
  async getInitialData(
    @Query('advertsOnPage') advertsOnPage: number,
    @Query('articlesOnPage') articlesOnPage: number,
  ): Promise<IServerResponse<IPortalInitialData>> {
    const result = await this.portalService.getInitialData(advertsOnPage, articlesOnPage);
    return result;
  }
}
