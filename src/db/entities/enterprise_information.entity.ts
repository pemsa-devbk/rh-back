import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

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
        () => User,
        (user) => user.enterpriseInformation
    )
    @JoinColumn({ name: 'user_id' })
    user: User;
}