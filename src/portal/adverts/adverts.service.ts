import { Component } from '@nestjs/common';

import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';

import { IServerResponse } from '@kolenergo/core';
import { IAdvert, IAttachment, Advert } from '@kolenergo/portal';
import { PostgresService } from '../../common/database/postgres.service';

@Component()
export class AdvertsService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Получение объявления по идентификатору
   * @param advertId - Идентификатор объявления
   */
  async getAdvertById(advertId: number): Promise<IServerResponse<IAdvert>> {
    const result = await this.postgresService.query(
      'portal-get-advert',
      'SELECT portal.adverts_get_by_id($1, $2)',
      [advertId, true],
      'adverts_get_by_id',
    );
    return result;
  }

  /**
   * Получение страницы объявлений
   * @param page - Порядковый номер страницы
   * @param advertsOnPage - Количество объявлений на странице
   */
  async getAdvertsPage(page: number, advertsOnPage: number): Promise<IServerResponse<IAdvert[]>> {
    const result = await this.postgresService.query(
      'portal-get-adverts-page',
      'SELECT portal.adverts_get_page($1, $2, $3)',
      [page, advertsOnPage, false],
      'adverts_get_page',
    );
    return result;
  }

  /**
   * Получение похожих объявлений
   * @param advertId - Идентификатор объявления, на основе которого ищутся похожие
   */
  async getSimilarAdverts(advertId: number): Promise<IServerResponse<IAdvert[]>> {
    return await this.postgresService.query(
      'portal-get-similar-adverts',
      'SELECT portal.adverts_get_similar($1)',
      [advertId],
      'adverts_get_similar',
    );
  }

  /**
   * Добавление нового объявления
   * @param advert - Добавляемое объявление
   * @param page - Текущая страница объявлений
   * @param advertsOnPage - Количество объявлений на странице
   */
  async addAdvert(
    advert?: Advert,
    page?: number,
    advertsOnPage?: number,
  ): Promise<IServerResponse<{adverts: IAdvert[], advert: IAdvert, total: number}>> {
    if (advert) {
      const result = await this.postgresService.query(
        'portal-add-advert',
        'SELECT portal.adverts_add($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [
          advert.user.id,
          advert.title,
          advert.preview,
          advert.markup,
          advert.image,
          advert.dateCreated,
          advert.isTemplate,
          advert.attachments,
          true,
          page,
          advertsOnPage,
        ],
        'adverts_add',
      );
      if (advert.image) {
        const url = advert.image.split('/').filter((segment) => {
          return segment.length > 1 ? true : false;
        });
        const folderPath = path.resolve('static', 'portal', 'adverts', result.data.advert.id.toString());
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }
        fs.copyFileSync(
          path.resolve('static', ...url),
          path.resolve('static', 'portal', 'adverts', result.data.advert.id.toString(), url[url.length - 1]),
        );
      }
      return result;
    } else {
      const result = await this.postgresService.query(
        'portal-add-advert',
        'SELECT portal.adverts_add($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [null, null, null, null, null, 0, false, [], false, page, advertsOnPage],
        'adverts_add',
      );
      return result;
    }
  }

  /**
   * Изменение объявления
   * @param advert - Изменяемое объявление
   * @param page - Текущая страница объявлений
   * @param advertsOnPage - Количество объявлений на странице
   */
  async editAdvert(advert: IAdvert, page: number, advertOnPage: number): Promise<IServerResponse<IAdvert>> {
    return await this.postgresService.query(
      'portal-edit-advert',
      'SELECT portal.adverts_edit($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [
        advert.id,
        advert.title,
        advert.preview,
        advert.image,
        advert.markup,
        advert.dateCreated,
        advert.isTemplate,
        advert.attachments,
        page,
        advertOnPage,
      ],
      'adverts_edit',
    );
  }

  /**
   * Поиск объявлений
   * @param query - Условие поиск
   */
  async searchAdvert(query: string): Promise<IServerResponse<IAdvert[]>> {
    const result = await this.postgresService.query(
      'portal-search-adverts',
      'SELECT portal.adverts_search($1)',
      [query],
      'adverts_search',
    );
    return result;
  }

  /**
   * Загрузка изображения в новое объявление
   * @param image - Загружаемое изображение
   */
  async uploadImageToNewAdvert(image, header: boolean): Promise<IServerResponse<{url: string, advert: IAdvert}>> {
    const advert: IServerResponse<{adverts: IAdvert[], advert: IAdvert, total: number}> = await this.addAdvert();
    const folderPath = path.resolve('static', 'portal', 'adverts', advert.data.advert.id.toString());
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
      const filePath = path.resolve(
        'static',
        'portal',
        'adverts',
        advert.data.advert.id.toString(), header ? `header_${image.originalname}` : image.originalname,
      );
      const fileUrl = path.relative(
        './static',
        `./static/portal/adverts/${advert.data.advert.id.toString()}/${header ? 'header_' + image.originalname : image.originalname}`,
      );
      fs.writeFileSync(filePath, image.buffer);
      advert.data.advert.image = header ? fileUrl : null;
      return new Promise<IServerResponse<{url: string, advert: IAdvert}>>((resolve) => {
        resolve({data: {url: fileUrl, advert: advert.data.advert}});
      });
    }
  }

  /**
   * Загрузка изображения в объявление
   * @param advertId - Идентификатор объявления
   * @param image - Загружаемое изображение
   */
  async uploadImageToAdvert(advertId: number, image, header: boolean): Promise<IServerResponse<string>> {
    const folderPath = path.resolve('static', 'portal', 'adverts', advertId.toString());
    if (fs.existsSync(folderPath)) {
      const filePath = path.resolve(
        'static',
        'portal',
        'adverts',
        advertId.toString(),
        header ? `header_${image.originalname}` : image.originalname,
      );
      const fileUrl = path.relative(
        './static',
        `./static/portal/adverts/${advertId.toString()}/${header ? 'header_' + image.originalname : image.originalname}`,
      );
      fs.writeFileSync(filePath, image.buffer);
      return new Promise<IServerResponse<string>>((resolve) => {
        resolve({data: fileUrl});
      });
    }
  }

  async uploadAttachmentToNewAdvert(file, userId: number): Promise<IServerResponse<IAdvert>> {
    const advert: IServerResponse<{adverts: IAdvert[], advert: IAdvert, total: number}> = await this.addAdvert();
    const folderPath = path.resolve('static', 'portal', 'adverts', 'attachments', advert.data.advert.id.toString());
    const advertPath = path.resolve('static', 'portal', 'adverts', advert.data.advert.id.toString());
    const attachmentPath = path.resolve('static', 'portal', 'adverts', advert.data.advert.id.toString(), 'attachments');
    console.log(folderPath);
    console.log(`directory ${folderPath} ${fs.existsSync(folderPath) ? ' exists' : ' does not exists'}`);

    if (!fs.existsSync(advertPath)) {
      fs.mkdirSync(advertPath);
      if (!fs.existsSync(attachmentPath)) {
        fs.mkdirSync(attachmentPath);
        const filePath = path.resolve('static', 'portal', 'adverts', advert.data.advert.id.toString(), 'attachments', file.originalname);
        const fileUrl = path.relative('./static', `./static/portal/adverts/${advert.data.advert.id.toString()}/attachments/${file.originalname}`);
        fs.writeFileSync(filePath, file.buffer);
        await this.postgresService.query(
          'portal-add-attachment',
          'SELECT portal.attachments_add($1, $2, $3, $4, $5)',
          [advert.data.advert.id, 0, userId, fileUrl, file.size],
          'attachments_add',
        );
        const result = await this.postgresService.query(
          'portal-adverts-get-by-id',
          'SELECT portal.adverts_get_by_id($1)',
          [advert.data.advert.id],
          'adverts_get_by_id',
        );
        return result;
      }
    }
  }

  async uploadAttachmentToAdvert(file, advertId, userId): Promise<IServerResponse<IAdvert>> {
    const folderPath = path.resolve('static', 'portal', 'adverts', advertId.toString(), 'attachments');
    console.log(folderPath);
    console.log(`directory ${folderPath} ${fs.existsSync(folderPath) ? ' exists' : ' does not exists'}`);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    const filePath = path.resolve('static', 'portal', 'adverts', advertId.toString(), 'attachments', file.originalname);
    const fileUrl = path.relative('./static', `./static/portal/adverts/${advertId.toString()}/attachments/${file.originalname}`);
    fs.writeFileSync(filePath, file.buffer);
    await this.postgresService.query(
      'portal-add-attachment',
      'SELECT portal.attachments_add($1, $2, $3, $4, $5)',
      [advertId, 0, userId, fileUrl, file.size],
      'attachments_add',
    );
    const result = await this.postgresService.query(
      'portal-adverts-get-by-id',
      'SELECT portal.adverts_get_by_id($1)',
      [advertId],
      'adverts_get_by_id',
    );
    return result;
  }

  /**
   * Удалиение вложения в объявлении
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
   * Удаление объявления
   * @param advertId - Идентификатор удаляемого объявления
   */
  async removeAdvert(advertId: number): Promise<IServerResponse<boolean>> {
    const result = await this.postgresService.query(
      'portal-delete-advert',
      'SELECT portal.adverts_remove_by_id($1)',
    [advertId],
      'adverts_remove_by_id',
    );
    const folderPath = path.resolve('static', 'portal', 'adverts', advertId.toString());
    if (fs.existsSync(folderPath)) {
      rimraf.sync(folderPath);
    }
    return result;
  }
}
