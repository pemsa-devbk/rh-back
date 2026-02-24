import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Colony } from "./colony.entity";

@Entity({name: 'addresses'})
export class Address {
    @PrimaryGeneratedColumn('increment')
    address_id: number;

    @Column({type: 'varchar', length: 200})
    street: string;

    @Column({type: 'text', nullable: true})
    references: string;

    @Column({ type: 'varchar', length: 5 })
    user_id: string;

    @Column()
    colony_id: number;

    // * Relaciones
    @OneToOne(
        () => User,
        (user) => user.address
    )
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(
        () => Colony,
        (colony) => colony.addresses,
        {onDelete: 'CASCADE'}
    )
    @JoinColumn({name: 'colony_id'})
    colony: Colony;

}