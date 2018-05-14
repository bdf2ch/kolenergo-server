import { Controller, Post, Get } from '@nestjs/common';
import { AhoRequestsService } from './aho-requests.service';
import { IAhoRequestType } from '@kolenergo/aho-requests';

@Controller('aho')
export class AhoRequestsController {
    constructor(private readonly ahoRequestsService: AhoRequestsService) {}

    @Get('/types')
    async getRequestTypes(): Promise<IAhoRequestType[]> {
        const result = await this.ahoRequestsService.getRequestTypes();
        return result;
    }
}