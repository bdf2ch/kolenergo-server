import { Controller, Post, Get, Body, Param, Query, Delete, Patch} from '@nestjs/common';
import { ControlPanelService } from './control-panel.service';
import { IServerResponse } from '@kolenergo/lib';
import { IControlPanelInitData } from '@kolenergo/cp';

@Controller('cp')
export class ControlPanelController {
    constructor(private readonly controlPanelService: ControlPanelService) {}

    @Get('init')
    async getInitialData(): Promise<IServerResponse<IControlPanelInitData>> {
        const result = await this.controlPanelService.getInitialData();
        return result;
    }
}