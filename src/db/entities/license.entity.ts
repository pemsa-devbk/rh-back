import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Employee } from "./employee.entity";

@Entity({ name: 'licenses' })
export class License {

    @Column({ type: 'date' })
    issue_date: Date;
    
    @Column({ type: 'tinyint'})
    type: number;

    @Column({ type: 'date' })
    validity: Date;

    @PrimaryColumn({ type: 'varchar', length: 5 })
    employee_id: string;

    // * Relaciones
    @OneToOne(
        () => Employee,
        (employee) => employee.license
    )
    @JoinColumn({ name: 'employee_id' })
    employee: Employee;
}