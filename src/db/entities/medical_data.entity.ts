import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'medical_data' })
export class MedicalData {

    @PrimaryGeneratedColumn('increment')
    medical_data_id: number;

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

    @Column({ type: 'varchar', length: 5 })
    user_id: string;

    // * Relaciones
    @OneToOne(
        () => User,
        (user) => user.medicalData
    )
    @JoinColumn({ name: 'user_id' })
    user: User;

}