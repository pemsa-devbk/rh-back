import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Area } from "./area.entity";
import { Office } from "./office.entity";
import { Employee } from "./employee";

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
        () => Employee,
        (employee) => employee.departmentsInCharge,
        { onDelete: 'SET NULL' }
    )
    @JoinColumn({ name: 'responsible_user_id' })
    responsibleUser: Employee;

    @OneToMany(
        () => Area,
        (area) => area.department
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