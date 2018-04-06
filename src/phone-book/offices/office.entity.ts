import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Office {
    @PrimaryGeneratedColumn({
        comment: 'Идентификатор офиса',
    })
    id: number;

    @Column({
        comment: 'Идентификатор организации, к которой относится офис',
    })
    organizationId: number;

    @Column({
        comment: 'Адрес офиса',
    })
    address: string;

    @Column({
        comment: 'Населенный пункт',
    })
    city: string;
}