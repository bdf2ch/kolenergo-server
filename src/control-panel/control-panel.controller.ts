import { Controller, Post, Get, Body, Param, Query, Delete, Patch} from '@nestjs/common';
import { ControlPanelService } from './control-panel.service';
import { IServerResponse, IControlPanelInitData } from '@kolenergo/cpa';

@Controller('cp')
export class ControlPanelController {
    constructor(private readonly controlPanelService: ControlPanelService) {}

    @Get('/')
    async init(): Promise<IServerResponse<IControlPanelInitData>> {
        return await this.controlPanelService.getInitialData();
    }
}
