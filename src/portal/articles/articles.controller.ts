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
import { IArticle, Article } from '@kolenergo/portal';
import { ArticlesService } from './articles.service';

@Controller('portal/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('/')
  async getArticlesPage(
    @Query('sectionId') sectionId: number,
    @Query('page') page: number,
    @Query('articlesOnPage') articlesOnPage: number,
    @Query('search') search: string,
  ): Promise<IServerResponse<IArticle[]>> {
    if (search) {
      return await this.articlesService.searchArticles(sectionId, search);
    } else if (page && articlesOnPage) {
      return await this.articlesService.getArticlesPage(sectionId, page, articlesOnPage);
    }
  }

  @Get('/:id')
  async getArticle(@Param('id') articleId: number): Promise<IServerResponse<IArticle>> {
    return await this.articlesService.getArticleById(articleId);
  }

  @Patch('/:id')
  async editArticle(@Body() article: Article): Promise<IServerResponse<IArticle>> {
    return await this.articlesService.editArticle(article);
  }

  @Delete('/:id')
  async removeArticle(@Param('id') articleId: number): Promise<IServerResponse<boolean>> {
    return await this.articlesService.removeArticle(articleId);
  }

  @Post('/')
  async addArticle(@Body() article: Article): Promise<IServerResponse<IArticle>> {
    return await this.articlesService.addArticle(article);
  }

  @Put('/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImageToNewArticle(@UploadedFile() file, @Query('header') header: boolean) {
    return await this.articlesService.uploadImageToNewArticle(file, header);
  }

  @Put('/:id/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImageToArticle(@Param('id') articleId: number, @UploadedFile() file, @Query('header') header: boolean) {
    return await this.articlesService.uploadImageToArticle(articleId, file, header);
  }

  @Put('/attachments')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachmentToNewArticle(@UploadedFile() file, @Query('userId') userId: number) {
    return await this.articlesService.uploadAttachmentToNewArticle(file, userId);
  }

  @Put('/:id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachmentToArticle(@UploadedFile() file, @Param('id') articleId: number, @Query('userId') userId: number) {
    return await this.articlesService.uploadAttachmentToArticle(file, articleId, userId);
  }

  @Delete('/attachments/:id')
  async removeAttachment(@Param('id') attachmentId: number): Promise<IServerResponse<boolean>> {
    return await this.articlesService.removeAttachment(attachmentId);
  }
}
