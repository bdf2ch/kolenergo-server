import { Component } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOffice } from './office.interface';
import { Office } from './office.entity';

@Component()
export class OfficesService {
    constructor(@InjectRepository(Office) private readonly officesRepository: Repository<Office>) {}

    async findAll(): Promise<Office[]> {
        return await this.officesRepository.find();
    }

    /*
    findOne(id: number): IOffice | null {
        return new Promise((resolve) => {
            let result: IOffice | null = null;
            this.offices.map((office: IOffice) => {
                if (office.id === id) {
                    console.log(office);
                    result = office;
                }
            });
            resolve(result);
        });
    }
    */

    create(office: IOffice) {
        return office;
    }
}