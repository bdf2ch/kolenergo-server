import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('phonebook_office', {
    skipSync: false,
})
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

    @CreateDateColumn({
        comment: 'Дата создания',
    })
    createdAt: any;

    @UpdateDateColumn({
        comment: 'Дата изменения',
    })
    updatedAt: any;

}