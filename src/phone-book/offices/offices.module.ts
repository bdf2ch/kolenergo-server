import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficesController } from './offices.controller';
import { OfficesService } from './offices.service';
import { Office } from './office.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Office])],
    components: [OfficesService],
    controllers: [OfficesController],
})
export class OfficesModule {

}