import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Employee } from "./employee";

@Entity({ name: 'enterprise_information' })
export class EnterpriseInformation {
    @PrimaryGeneratedColumn('identity')
    id_contact_enterprise: number;

    @Column({ type: 'varchar', length: 254, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    cell_phone: string;

    @Column({ type: 'varchar', length: 6 })
    ext: string;

    @Column({ type: 'varchar', length: 5 })
    user_id: string;

    // * Relaciones
    @OneToOne(
        () => Employee,
        (employee) => employee.enterpriseInformation
    )
    @JoinColumn({ name: 'user_id' })
    employee: Employee;
}