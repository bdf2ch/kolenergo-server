import { Controller, Post, Get, Body, Param, Query, Delete, Patch } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { IServerResponse, IApplication, IPermission, IRole } from '@kolenergo/core';
import {Application} from 'express';

@Controller('cp/applications')
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post('/')
  async addApplication(@Body() application: Application): Promixe<IServerResponse<IApplication>> {
    return await this.applications.addApplication(application);
  }

  /*
  @Get('/')
  async getApplications(): Promise<IServerResponse<IApplication[]>> {
    const result = await this.applicationsService.getApplications();
    return result;
  }

  @Post('/roles')
  async addRole(@Body() role: IRole): Promise<IServerResponse<IRole>> {
    const result = await this.applicationsService.addRole(role);
    return result;
  }

  @Patch('/roles/:id')
  async editRole(@Body() role: IRole): Promise<IServerResponse<IRole>> {
    const result = await this.applicationsService.editRole(role);
    return result;
  }

  @Post('/permissions')
  async addPermission(@Body() permission: IPermission): Promise<IServerResponse<IPermission>> {
    const result = await this.applicationsService.addPermission(permission);
    return result;
  }

  @Patch('/permissions/:id')
  async editPermission(@Body() permission: IPermission): Promise<IServerResponse<IPermission>> {
    const result = await this.applicationsService.editPermission(permission);
    return result;
  }
  */
}
