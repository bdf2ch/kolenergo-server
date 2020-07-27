import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ControlPanelService } from './control-panel.service';
import { IServerResponse } from '@kolenergo/core';
import { IInitialData } from '@kolenergo/cpa';

@Controller('cp')
export class ControlPanelController {
    constructor(private readonly controlPanelService: ControlPanelService) {}

    @Get('/')
    async init(): Promise<IServerResponse<IInitialData>> {
        return await this.controlPanelService.getInitialData();
    }
}
