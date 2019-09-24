import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Delete,
  Patch,
  UseInterceptors,
  FileInterceptor,
  UploadedFile,
  Put,
} from '@nestjs/common';

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
    @Query('search') search: string,
  ): Promise<IServerResponse<IAdvert[]>> {
    if (search) {
      return await this.advertsService.searchAdvert(search);
    } else if (page && advertsOnPage) {
      return await this.advertsService.getAdvertsPage(page, advertsOnPage);
    }
  }

  @Get('/:id')
  async getAdvert(@Param('id') advertId: number): Promise<IServerResponse<IAdvert>> {
    return await this.advertsService.getAdvertById(advertId);
  }

  @Patch('/:id')
  async editAdvert(@Body() advert: Advert): Promise<IServerResponse<IAdvert>> {
    return await this.advertsService.editAdvert(advert);
  }

  @Delete('/:id')
  async deleteAdvert(@Param('id') advertId: number): Promise<IServerResponse<boolean>> {
    return await this.advertsService.removeAdvert(advertId);
  }

  @Post('/')
  async addAdvert(@Body() advert: Advert): Promise<IServerResponse<IAdvert>> {
    return await this.advertsService.addAdvert(advert);
  }

  @Put('/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImageToNewAdvert(@UploadedFile() file, @Query('header') header: boolean) {
    return await this.advertsService.uploadImageToNewAdvert(file, header);
  }

  @Put('/:id/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImageToAdvert(@Param('id') advertId: number, @UploadedFile() file, @Query('header') header: boolean) {
    return await this.advertsService.uploadImageToAdvert(advertId, file, header);
  }

  @Put('/attachments')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachmentToNewAdvert(@UploadedFile() file, @Query('userId') userId: number) {
    return await this.advertsService.uploadAttachmentToNewAdvert(file, userId);
  }

  @Put('/:id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachmentToAdvert(@UploadedFile() file, @Param('id') advertId: number, @Query('userId') userId: number) {
    return await this.advertsService.uploadAttachmentToAdvert(file, advertId, userId);
  }

  @Delete('/attachments/:id')
  async removeAttachment(@Param('id') attachmentId: number): Promise<IServerResponse<boolean>> {
    return await this.advertsService.removeAttachment(attachmentId);
  }
}
