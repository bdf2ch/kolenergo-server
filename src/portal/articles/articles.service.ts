import { Component } from '@nestjs/common';

import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';

import { IServerResponse } from '@kolenergo/core';
import { IAttachment, IArticle, Article } from '@kolenergo/portal';
import { PostgresService } from '../../common/database/postgres.service';

@Component()
export class ArticlesService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Получение статьи по идентификатору
   * @param articleId - Идентификатор статьи
   */
  async getArticleById(articleId: number): Promise<IServerResponse<IArticle>> {
    const result = await this.postgresService.query(
      'portal-get-article',
      'SELECT portal.articles_get_by_id($1)',
      [articleId],
      'articles_get_by_id',
    );
    return result;
  }

  /**
   * Получение страницы статей
   * @param sectionId - Идентфиикатор раздела статей
   * @param page - Порядковый номер страницы
   * @param articlesOnPage - Количество статей на странице
   */
  async getArticlesPage(sectionId: number, page: number, articlesOnPage: number): Promise<IServerResponse<IArticle[]>> {
    const result = await this.postgresService.query(
      'portal-get-articles-page',
      'SELECT portal.articles_get_page($1, $2, $3)',
      [sectionId, page, articlesOnPage],
      'articles_get_page',
    );
    return result;
  }

  /**
   * Добавление новой статьи
   * @param article - Добавляемая статья
   */
  async addArticle(article?: Article): Promise<IServerResponse<IArticle>> {
    if (article) {
      const result = await this.postgresService.query(
        'portal-add-article',
        'SELECT portal.articles_add($1, $2, $3, $4, $5, $6, $7)',
        [article.section.id, article.user.id, article.title, article.preview, article.content, article.columns, true],
        'adverts_add',
      );
      return result;
    } else {
      const result = await this.postgresService.query(
        'portal-add-article',
        'SELECT portal.articles_add($1, $2, $3, $4, $5, $6, $7)',
        [null, null, null, null, null, null, false],
        'articles_add',
      );
      return result;
    }
  }

  /**
   * Изменение статьи
   * @param article - Изменяемая статья
   */
  async editArticle(article: IArticle): Promise<IServerResponse<IArticle>> {
    const result = await this.postgresService.query(
      'portal-edit-article',
      'SELECT portal.articles_edit($1, $2, $3, $4, $5, $6, $7)',
      [article.id, article.section.id, article.title, article.preview, article.content, article.image, article.columns],
      'articles_edit',
    );
    return result;
  }

  /**
   * Поиск статей
   * @param sectionId - Идентификатор раздела статей
   * @param query - Условие поиска
   */
  async searchArticles(sectionId: number, query: string): Promise<IServerResponse<IArticle[]>> {
    const result = await this.postgresService.query(
      'portal-search-articles',
      'SELECT portal.articles_search($1, $2)',
      [sectionId, query],
      'articles_search',
    );
    return result;
  }

  /**
   * Загрузка изображения в новую статью
   * @param image - Загружаемое изображение
   */
  async uploadImageToNewArticle(image, header: boolean): Promise<IServerResponse<{url: string, article: IArticle}>> {
    const article: IServerResponse<IArticle> = await this.addArticle();
    const folderPath = path.resolve('static', 'portal', 'articles', article.data.id.toString());
    console.log(folderPath);
    console.log(`directory ${folderPath} ${fs.existsSync(folderPath) ? ' exists' : ' does not exists'}`);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
      const filePath = path.resolve(
        'static',
        'portal',
        'articles',
        article.data.id.toString(), header ? `header_${image.originalname}` : image.originalname,
      );
      const fileUrl = path.relative(
        './static',
        `./static/portal/articles/${article.data.id.toString()}/${header ? 'header_' + image.originalname : image.originalname}`,
      );
      fs.writeFileSync(filePath, image.buffer);
      article.data.image = header ? fileUrl : null;
      return new Promise<IServerResponse<{url: string, article: IArticle}>>((resolve) => {
        resolve({data: {url: fileUrl, article: article.data}});
      });
    }
  }

  /**
   * Загрузка изображения в статью
   * @param articleId - Идентификатор статьи
   * @param image - Загружаемое изображение
   */
  async uploadImageToArticle(articleId: number, image, header: boolean): Promise<IServerResponse<string>> {
    const folderPath = path.resolve('static', 'portal', 'articles', articleId.toString());
    console.log(folderPath);
    console.log(`directory ${folderPath} ${fs.existsSync(folderPath) ? ' exists' : ' does not exists'}`);

    if (fs.existsSync(folderPath)) {
      const filePath = path.resolve(
        'static',
        'portal',
        'articles',
        articleId.toString(),
        header ? `header_${image.originalname}` : image.originalname,
      );
      const fileUrl = path.relative(
        './static',
        `./static/portal/articles/${articleId.toString()}/${header ? 'header_' + image.originalname : image.originalname}`,
      );
      fs.writeFileSync(filePath, image.buffer);
      return new Promise<IServerResponse<string>>((resolve) => {
        resolve({data: fileUrl});
      });
    }
  }

  /**
   * Загрузка вложения в новую статью
   * @param file - Загружаемый файл
   * @param userId - Идентификатор пользователя
   */
  async uploadAttachmentToNewArticle(file, userId: number): Promise<IServerResponse<IArticle>> {
    const article: IServerResponse<IArticle> = await this.addArticle();
    const folderPath = path.resolve('static', 'portal', 'articles', 'attachments', article.data.id.toString());
    const articlePath = path.resolve('static', 'portal', 'articles', article.data.id.toString());
    const attachmentPath = path.resolve('static', 'portal', 'articles', article.data.id.toString(), 'attachments');
    console.log(folderPath);
    console.log(`directory ${folderPath} ${fs.existsSync(folderPath) ? ' exists' : ' does not exists'}`);

    if (!fs.existsSync(articlePath)) {
      fs.mkdirSync(articlePath);
      if (!fs.existsSync(attachmentPath)) {
        fs.mkdirSync(attachmentPath);
        const filePath = path.resolve('static', 'portal', 'articles', article.data.id.toString(), 'attachments', file.originalname);
        const fileUrl = path.relative('./static', `./static/portal/articles/${article.data.id.toString()}/attachments/${file.originalname}`);
        fs.writeFileSync(filePath, file.buffer);
        await this.postgresService.query(
          'portal-add-attachment',
          'SELECT portal.attachments_add($1, $2, $3, $4, $5)',
          [article.data.id, 0, userId, fileUrl, file.size],
          'attachments_add',
        );
        const result = await this.postgresService.query(
          'portal-articles-get-by-id',
          'SELECT portal.articles_get_by_id($1)',
          [article.data.id],
          'articles_get_by_id',
        );
        return result;
      }
    }
  }

  /**
   * Загрузка вложения в статью
   * @param file - Загружаемый файл
   * @param articleId - Идентификатор стаьи
   * @param userId - Идентификатор пользователя
   */
  async uploadAttachmentToArticle(file, articleId, userId): Promise<IServerResponse<IArticle>> {
    const folderPath = path.resolve('static', 'portal', 'articles', articleId.toString(), 'attachments');
    console.log(folderPath);
    console.log(`directory ${folderPath} ${fs.existsSync(folderPath) ? ' exists' : ' does not exists'}`);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    const filePath = path.resolve('static', 'portal', 'articles', articleId.toString(), 'attachments', file.originalname);
    const fileUrl = path.relative('./static', `./static/portal/articles/${articleId.toString()}/attachments/${file.originalname}`);
    fs.writeFileSync(filePath, file.buffer);
    await this.postgresService.query(
      'portal-add-attachment',
      'SELECT portal.attachments_add($1, $2, $3, $4, $5)',
      [articleId, 0, userId, fileUrl, file.size],
      'attachments_add',
    );
    const result = await this.postgresService.query(
      'portal-articles-get-by-id',
      'SELECT portal.articles_get_by_id($1)',
      [articleId],
      'articles_get_by_id',
    );
    return result;
  }

  /**
   * Удалиение вложения в статье
   * @param attachmentId - Идентификатор вложения
   */
  async removeAttachment(attachmentId: number): Promise<IServerResponse<boolean>> {
    const attachment: IServerResponse<IAttachment> = await this.postgresService.query(
      'portal-get-attachment-by-id',
      'SELECT portal.attachments_get_by_id($1)',
      [attachmentId],
      'attachments_get_by_id',
    );
    const result =  await this.postgresService.query(
      'portal-remove-attachment',
      'SELECT portal.attachments_remove_by_id($1)',
      [attachmentId],
      'attachments_remove_by_id',
    );
    const attachmentPath = path.resolve('static', attachment.data.url);
    console.log(attachmentPath);
    console.log(`attachment ${attachmentPath} ${fs.existsSync(attachmentPath) ? ' exists' : ' does not exists'}`);
    if (fs.existsSync(attachmentPath)) {
      fs.unlinkSync(attachmentPath);
    }
    return result;
  }

  /**
   * Удаление статьи
   * @param articleId - Идентификатор удаляемой статьи
   */
  async removeArticle(articleId: number): Promise<IServerResponse<boolean>> {
    const result = await this.postgresService.query(
      'portal-delete-article',
      'SELECT portal.articles_remove_by_id($1)',
      [articleId],
      'articles_remove_by_id',
    );

    const folderPath = path.resolve('static', 'portal', 'articles', articleId.toString());
    console.log(folderPath);
    console.log(`directory ${folderPath} ${fs.existsSync(folderPath) ? ' exists' : ' does not exists'}`);
    if (fs.existsSync(folderPath)) {
      rimraf.sync(folderPath);
    }
    return result;
  }
}
