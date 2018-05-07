import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, PrimaryColumn, Generated} from 'typeorm';

@Entity({})
export class User {
    @PrimaryGeneratedColumn({
        comment: 'Идентификатор пользователя',
    })
    id: number;

    @Column({
        comment: 'Имя пользователя',
    })
    firstName: string;

    @Column({
        comment: 'Отчество пользователя',
    })
    secondName: string;

    @Column({
        comment: 'Фамилия пользователя',
    })
    lastName: string;

    @Column({
        comment: 'Должность пользователя',
    })
    position: string;

    @CreateDateColumn({
        comment: 'Дата создания',
    })
    createdAt: any;

    @UpdateDateColumn({
        comment: 'Дата изменения',
    })
    updatedAt: any;
}