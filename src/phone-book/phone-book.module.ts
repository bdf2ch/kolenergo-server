import { Module } from '@nestjs/common';
import { OfficesModule } from './offices/offices.module';

@Module({
    imports: [OfficesModule],
    components: [],
    controllers: [],
    exports: [OfficesModule],
})
export class PhoneBookModule {

}