import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { Colony } from "./colony.entity";
import { Employee } from "./employee.entity";

@Entity({name: 'addresses'})
export class Address {

    @Column({type: 'varchar', length: 200})
    street: string;

    @Column({type: 'varchar', nullable: true})
    references: string;

    @PrimaryColumn({ type: 'varchar', length: 5 })
    employee_id: string;

    @Column()
    colony_id: number;

    // * Relaciones
    @OneToOne(
        () => Employee,
        (employee) => employee.address
    )
    @JoinColumn({ name: 'employee_id' })
    employee: Employee;

    @ManyToOne(
        () => Colony,
        (colony) => colony.addresses,
        {onDelete: 'CASCADE'}
    )
    @JoinColumn({name: 'colony_id'})
    colony: Colony;

}