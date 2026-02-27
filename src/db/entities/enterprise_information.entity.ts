import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Employee } from "./employee";

@Entity({ name: 'enterprise_information' })
export class EnterpriseInformation {

    @Column({ type: 'varchar', length: 254, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    cell_phone: string;

    @Column({ type: 'varchar', length: 6, nullable: true })
    ext: string;

    @PrimaryColumn({ type: 'varchar', length: 5 })
    user_id: string;

    // * Relaciones
    @OneToOne(
        () => Employee,
        (employee) => employee.enterpriseInformation
    )
    @JoinColumn({ name: 'user_id' })
    employee: Employee;
}