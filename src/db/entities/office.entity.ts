import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Enterprise } from "./enterprise.entity";
import { Department } from "./department.entity";

@Entity({name: 'offices'})
export class Office {
    @PrimaryGeneratedColumn('increment')
    office_id: number;

    @Column({type: 'varchar', length: 150})
    name: string;

    @Column()
    enterprise_id: string;

    //* Relaciones 

    @OneToMany(
        () => Department,
        (department) => department.office
    )
    departments: Department[];

    @ManyToOne(
        () => Enterprise,
        (enterprise) => enterprise.offices,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'enterprise_id' })
    enterprise: Enterprise;
}