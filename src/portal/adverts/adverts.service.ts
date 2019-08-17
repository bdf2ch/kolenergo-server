import { Component } from '@nestjs/common';
import { PostgresService } from '../../common/database/postgres.service';
import { IServerResponse } from '@kolenergo/core';
import { IAdvert, IAttachment, Advert, Attachment } from '@kolenergo/portal';
import * as path from 'path';
import * as fs from 'fs';
import moment = require('moment');

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
   */
  async addAdvert(advert?: Advert): Promise<IServerResponse<IAdvert>> {
    if (advert) {
      const result = await this.postgresService.query(
        'portal-add-advert',
        'SELECT portal.adverts_add($1, $2, $3, $4)',
        [advert.user.id, advert.title, advert.preview, advert.content],
        'adverts_add',
      );
      return result;
    } else {
      const result = await this.postgresService.query(
        'portal-add-advert',
        'SELECT portal.adverts_add($1, $2, $3, $4)',
        [null, null, null, null],
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
      'SELECT portal.adverts_edit($1, $2, $3, $4)',
      [advert.id, advert.title, advert.preview, advert.content],
      'adverts_edit',
    );
    return result;
  }

  async uploadImageToNewAdvert(image): Promise<IServerResponse<{url: string, advert: IAdvert}>> {
    const advert: IServerResponse<IAdvert> = await this.addAdvert();
    const folderPath = path.resolve('portal', 'adverts', advert.data.id.toString());
    console.log(folderPath);
    console.log(`directory ${folderPath} ${fs.existsSync(folderPath) ? ' exists' : ' does not exists'}`);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
      const filePath = path.resolve('portal', 'adverts', advert.data.id.toString(), image.originalname);
      const fileUrl = path.relative('./portal', `./portal/adverts/${advert.data.id.toString()}/${image.originalname}`);
      fs.writeFileSync(filePath, image.buffer);
      return new Promise<IServerResponse<{url: string, advert: IAdvert}>>((resolve) => {
        resolve({data: {url: fileUrl, advert: advert.data}});
      });
    }
  }

  async uploadImageToAdvert(advertId: number, image): Promise<IServerResponse<string>> {
    const folderPath = path.resolve('portal', 'adverts', advertId.toString());
    console.log(folderPath);
    console.log(`directory ${folderPath} ${fs.existsSync(folderPath) ? ' exists' : ' does not exists'}`);

    if (fs.existsSync(folderPath)) {
      const filePath = path.resolve('portal', 'adverts', advertId.toString(), image.originalname);
      const fileUrl = path.relative('./portal', `./portal/adverts/${advertId.toString()}/${image.originalname}`);
      fs.writeFileSync(filePath, image.buffer);
      return new Promise<IServerResponse<string>>((resolve) => {
        resolve({data: fileUrl});
      });
    }
  }

  async uploadAttachmentToNewAdvert(file, userId: number): Promise<IServerResponse<{attachment: IAttachment, advert: IAdvert}>> {
    const advert: IServerResponse<IAdvert> = await this.addAdvert();
    const folderPath = path.resolve('portal', 'adverts', 'attachments', advert.data.id.toString());
    console.log(folderPath);
    console.log(`directory ${folderPath} ${fs.existsSync(folderPath) ? ' exists' : ' does not exists'}`);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
      const filePath = path.resolve('portal', 'adverts', 'attachments', advert.data.id.toString(), file.originalname);
      const fileUrl = path.relative('./portal', `./portal/adverts/${advert.data.id.toString()}/attachments/${file.originalname}`);
      fs.writeFileSync(filePath, file.buffer);
      const attachment: IServerResponse<IAttachment> = await this.postgresService.query(
        'portal-add-attachment',
        'SELECT portal.attachments_add($1, $2, $3, $4, $5)',
        [advert.data.id, 0, advert.data.user.id, fileUrl, file.size],
        'attachments_add',
      );
      return new Promise<IServerResponse<{attachment: IAttachment, advert: IAdvert}>>((resolve) => {
        resolve({data: {attachment: attachment.data, advert: advert.data}});
      });
    }
  }

  async uploadAttachmentToAdvert(file, advertId, userId): Promise<IServerResponse<IAttachment>> {
      const folderPath = path.resolve('portal', 'adverts', advertId.toString(), 'attachments');
      console.log(folderPath);
      console.log(`directory ${folderPath} ${fs.existsSync(folderPath) ? ' exists' : ' does not exists'}`);

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
        const filePath = path.resolve('portal', 'adverts', advertId.toString(), 'attachments', file.originalname);
        const fileUrl = path.relative('./portal', `./portal/adverts/${advertId.toString()}/attachments/${file.originalname}`);
        fs.writeFileSync(filePath, file.buffer);
        const attachment = await this.postgresService.query(
          'portal-add-attachment',
          'SELECT portal.attachments_add($1, $2, $3, $4, $5)',
          [advertId, 0, userId, fileUrl, file.size],
          'attachments_add',
        );
        return attachment;
      }
  }
}
