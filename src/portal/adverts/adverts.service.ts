import { Component } from '@nestjs/common';

import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';

import { IServerResponse } from '@kolenergo/core';
import { IAdvert, IAttachment, Advert, Attachment } from '@kolenergo/portal';
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
      'SELECT portal.adverts_get_by_id($1)',
      [advertId],
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
      'SELECT portal.adverts_get_page($1, $2)',
      [page, advertsOnPage],
      'adverts_get_page',
    );
    return result;
  }

  /**
   * Добавление нового объявления
   * @param advert - Добавляемое объявление
   * @param page - Текущая страница объявлений
   * @param advertsOnPage - Количество объявлений на странице
   */
  async addAdvert(advert?: Advert, page?: number, advertsOnPage?: number): Promise<IServerResponse<{adverts: IAdvert[], advert: IAdvert}>> {
    if (advert) {
      const result = await this.postgresService.query(
        'portal-add-advert',
        'SELECT portal.adverts_add($1, $2, $3, $4, $5, $6, $7, $8)',
        [advert.user.id, advert.title, advert.preview, advert.content, advert.dateCreated, true, page, advertsOnPage],
        'adverts_add',
      );
      return result;
    } else {
      const result = await this.postgresService.query(
        'portal-add-advert',
        'SELECT portal.adverts_add($1, $2, $3, $4, $5, $6, $7, $8)',
        [null, null, null, null, 0, false, page, advertsOnPage],
        'adverts_add',
      );
      return result;
    }
  }

  /**
   * Изменение объявления
   * @param advert - Изменяемое объявление
   */
  async editAdvert(advert: IAdvert): Promise<IServerResponse<IAdvert>> {
    const result = await this.postgresService.query(
      'portal-edit-advert',
      'SELECT portal.adverts_edit($1, $2, $3, $4, $5, $6, $7)',
      [advert.id, advert.title, advert.preview, advert.image, advert.content, advert.dateCreated, advert.isTemplate],
      'adverts_edit',
    );
    return result;
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
    const advert: IServerResponse<IAdvert> = await this.addAdvert();
    const folderPath = path.resolve('static', 'portal', 'adverts', advert.data.id.toString());
    console.log(folderPath);
    console.log(`directory ${folderPath} ${fs.existsSync(folderPath) ? ' exists' : ' does not exists'}`);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
      const filePath = path.resolve(
        'static',
        'portal',
        'adverts',
        advert.data.id.toString(), header ? `header_${image.originalname}` : image.originalname,
      );
      const fileUrl = path.relative(
        './static',
        `./static/portal/adverts/${advert.data.id.toString()}/${header ? 'header_' + image.originalname : image.originalname}`,
      );
      fs.writeFileSync(filePath, image.buffer);
      advert.data.image = header ? fileUrl : null;
      console.log('header', header);
      console.log('image', advert.data.image);
      return new Promise<IServerResponse<{url: string, advert: IAdvert}>>((resolve) => {
        resolve({data: {url: fileUrl, advert: advert.data}});
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
    console.log(folderPath);
    console.log(`directory ${folderPath} ${fs.existsSync(folderPath) ? ' exists' : ' does not exists'}`);

    if (fs.existsSync(folderPath)) {
      // fs.mkdirSync(folderPath);
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
    const advert: IServerResponse<IAdvert> = await this.addAdvert();
    const folderPath = path.resolve('static', 'portal', 'adverts', 'attachments', advert.data.id.toString());
    const advertPath = path.resolve('static', 'portal', 'adverts', advert.data.id.toString());
    const attachmentPath = path.resolve('static', 'portal', 'adverts', advert.data.id.toString(), 'attachments');
    console.log(folderPath);
    console.log(`directory ${folderPath} ${fs.existsSync(folderPath) ? ' exists' : ' does not exists'}`);

    if (!fs.existsSync(advertPath)) {
      fs.mkdirSync(advertPath);
      if (!fs.existsSync(attachmentPath)) {
        fs.mkdirSync(attachmentPath);
        const filePath = path.resolve('static', 'portal', 'adverts', advert.data.id.toString(), 'attachments', file.originalname);
        const fileUrl = path.relative('./static', `./static/portal/adverts/${advert.data.id.toString()}/attachments/${file.originalname}`);
        fs.writeFileSync(filePath, file.buffer);
        await this.postgresService.query(
          'portal-add-attachment',
          'SELECT portal.attachments_add($1, $2, $3, $4, $5)',
          [advert.data.id, 0, userId, fileUrl, file.size],
          'attachments_add',
        );
        const result = await this.postgresService.query(
          'portal-adverts-get-by-id',
          'SELECT portal.adverts_get_by_id($1)',
          [advert.data.id],
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
    console.log(folderPath);
    console.log(`directory ${folderPath} ${fs.existsSync(folderPath) ? ' exists' : ' does not exists'}`);
    if (fs.existsSync(folderPath)) {
      rimraf.sync(folderPath);
    }
    return result;
  }
}
