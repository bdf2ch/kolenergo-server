import { Component } from '@nestjs/common';

import { IServerResponse } from '@kolenergo/core';
import { IDriver, Driver } from '@kolenergo/auto';
import { PostgresService } from '../../common/database/postgres.service';

@Component()
export class DriversService {
  constructor(private readonly postgresService: PostgresService) {}

  /**
   * Добавление водителя
   * @param driver - Добавляемый водитель
   */
  async addDriver(driver: Driver): Promise<IServerResponse<IDriver>> {
    return await this.postgresService.query(
      'auto-mrsk-add-driver',
      'SELECT auto-mrsk.drivers_add($1, $2, $3, $4)',
      [driver.firstName, driver.secondName, driver.lastName, driver.phone],
      'drivers_add',
    );
  }

  /**
   * Редактирование водителя
   * @param driver - Редактируемый водитель
   */
  async editDriver(driver: Driver): Promise<IServerResponse<IDriver>> {
    return await this.postgresService.query(
      'auto-mrsk-edit-driver',
      'SELECT auto-mrsk.drivers_edit($1, $2, $3, $4, $5)',
      [driver.id, driver.firstName, driver.secondName, driver.lastName, driver.phone],
      'drivers_edit',
    );
  }

  /**
   * Удаление водителя
   * @param driver - Удаляемый водитель
   */
  async removeDriver(driver: Driver): Promise<IServerResponse<boolean>> {
    return await this.postgresService.query(
      'auto-mrsk-remove-driver',
      'SELECT auto-mrsk.drivers_remove($1)',
      [driver.id],
      'drivers_remove',
    );
  }

  /**
   * Поиск водителя
   * @param query - Условие поиска
   */
  async searchDriver(query: string): Promise<IServerResponse<IDriver[]>> {
    return await this.postgresService.query(
      'auto-mrsk-search-driver',
      'SELECT auto-mrsk.drivers_search($1)',
      [query],
      'drivers_search',
    );
  }
}
