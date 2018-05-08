import { Controller, Get, Post, Param } from '@nestjs/common';
import { OfficesService } from './offices.service';
import { IOffice } from './office.interface';
import { Office } from './office.entity';

@Controller('phonebook/offices')
export class OfficesController {
    constructor(private readonly officesService: OfficesService) {}

    /**
     * Returns list of all offices
     * @returns {Promise<Office[]>}
     */
    @Get()
    async findAll(): Promise<Office[]> {
        return this.officesService.findAll();
    }

    @Get(':id')
    async findOne(@Param() params): Promise<IOffice> {
        return {id: 500, organization_id: 50, address: 'test address', city: 'test city'};
        //return this.officesService.findOne(params.id as number);
    }

    /**
     * Adding new office
     * @param {IOffice} office - Offcie, that needs no be added
     * @returns {Promise<IOffice>}
     */
    @Post()
    async create(office: IOffice): Promise<IOffice> {
        return this.officesService.create(office);
    }
}
