import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Area } from "./area.entity";
import { Office } from "./office.entity";
import { User } from "./user.entity";

@Entity({name: 'departments'})
export class Department {
    @PrimaryGeneratedColumn('increment')
    department_id: number;

    @Column({type: 'varchar', length: 150})
    name: string;

    @Column()
    office_id: number;

    @Column({ nullable: true, type: 'varchar', length: 5 })
    responsible_user_id: string;

    // * Relaciones
    @ManyToOne(
        () => User,
        (user) => user.departmentsInCharge,
        { onDelete: 'SET NULL' }
    )
    @JoinColumn({ name: 'responsible_user_id' })
    responsibleUser: User;

    @OneToMany(
        () => Area,
        (area) => area.deparment
    )
    areas: Area[];

    @ManyToOne(
        () => Office,
        (office) => office.departments,
        { onDelete: 'CASCADE'}
    )
    @JoinColumn({ name: 'office_id' })
    office: Office;
}