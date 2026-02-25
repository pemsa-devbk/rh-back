import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Employee } from "./employee";

@Entity({ name: 'licenses' })
export class License {
    @PrimaryGeneratedColumn('increment')
    license_id: number;

    @Column({ type: 'date' })
    issue_date: Date;
    
    @Column({ type: 'tinyint'})
    type: number;

    @Column({ type: 'date' })
    validity: Date;

    @Column({ type: 'varchar', length: 5 })
    user_id: string;

    // * Relaciones
    @OneToOne(
        () => Employee,
        (employee) => employee.license
    )
    @JoinColumn({ name: 'user_id' })
    employee: Employee;
}