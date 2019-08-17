import { Controller, Post, Get, Body, Param, Query, Delete, Patch, UseInterceptors, FileInterceptor, UploadedFile } from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { IAdvert, Advert } from '@kolenergo/portal';
import { AdvertsService } from './adverts.service';

@Controller('portal/adverts')
export class AdvertsController {
  constructor(private readonly advertsService: AdvertsService) {}

  @Get('/')
  async getAdvertsPage(
    @Query('page') page: number,
    @Query('advertsOnPage') advertsOnPage: number,
  ): Promise<IServerResponse<IAdvert[]>> {
    const result = await this.advertsService.getAdvertsPage(page, advertsOnPage);
    return result;
  }

  @Get('/:id')
  async getAdvert(@Param('id') advertId: number): Promise<IServerResponse<IAdvert>> {
    const result = await this.advertsService.getAdvertById(advertId);
    return  result;
  }

  @Patch('/:id')
  async editAdvert(@Body() advert: Advert): Promise<IServerResponse<IAdvert>> {
    const result = await this.advertsService.editAdvert(advert);
    return  result;
  }

  @Post('/')
  async addAdvert(@Body() advert: Advert): Promise<IServerResponse<IAdvert>> {
    const result = await this.advertsService.addAdvert(advert);
    return  result;
  }

  @Post('/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImageToNewAdvert(@UploadedFile() file) {
    console.log(file);
    const result = await this.advertsService.uploadImageToNewAdvert(file);
    return result;
  }

  @Post('/:id/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImageToAdvert(@Param('id') advertId: number, @UploadedFile() file) {
    console.log(file);
    const result = await this.advertsService.uploadImageToAdvert(advertId, file);
    return result;
  }

  @Post('/attachment')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachmentToNewAdvert(@UploadedFile() file, @Query('userId') userId: number) {
    console.log(file);
    const result = await this.advertsService.uploadAttachmentToNewAdvert(file, userId);
    return result;
  }

  @Post('/:id/attachment')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachmentToAdvert(@UploadedFile() file, @Param('id') advertId: number, @Query('userId') userId: number) {
    console.log(file);
    const result = await this.advertsService.uploadAttachmentToAdvert(file, advertId, userId);
    return result;
  }
}
