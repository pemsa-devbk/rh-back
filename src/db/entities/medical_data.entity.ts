import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Employee } from "./employee";

@Entity({ name: 'medical_data' })
export class MedicalData {

    @Column({
        type: 'varchar',
        nullable: true,
        length: 3
    })
    blood_type: string;

    @Column({
        type: 'text',
        nullable: true
    })
    allergies: string;

    @Column({
        type: 'varchar',
        length: 11,
        nullable: true
    })
    nss: string

    @Column({
        type: 'varchar',
        length: 300,
        nullable: true
    })
    diseases: string;

    @PrimaryColumn({ type: 'varchar', length: 5 })
    user_id: string;

    // * Relaciones
    @OneToOne(
        () => Employee,
        (employee) => employee.medicalData
    )
    @JoinColumn({ name: 'user_id' })
    employee: Employee;

}