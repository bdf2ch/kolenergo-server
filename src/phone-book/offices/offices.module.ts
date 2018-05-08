import { Module } from '@nestjs/common';
import { OfficesController } from './offices.controller';
import { OfficesService } from './offices.service';
import { Office } from './office.entity';

@Module({
    imports: [],
    components: [OfficesService],
    controllers: [OfficesController],
})
export class OfficesModule {

}