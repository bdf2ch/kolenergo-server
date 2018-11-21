import { Component } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { IServerResponse } from '@kolenergo/lib';
import { IControlPanelInitData } from '@kolenergo/cp';

@Component()
export class ControlPanelService {
    constructor(private readonly postgresService: PostgresService) {}

    /**
     * Получение данных для инициализации приложения
     */
    async getInitialData(): Promise<IServerResponse<IControlPanelInitData>> {
        const result = await this.postgresService.query(
            'control-panel-get-initial-data',
            `SELECT control_panel_get_initial_data()`,
            [],
            'control_panel_get_initial_data',
        );
        return result;
    }
}