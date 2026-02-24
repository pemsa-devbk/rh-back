import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'licenses' })
export class License {
    @PrimaryGeneratedColumn('increment')
    license_id: number;

    @Column({ type: 'date' })
    issue_date: Date;
    // TODO : posible Relación con entidad de tipos de licencia
    @Column({ type: 'tinyint'})
    type: number;

    @Column({ type: 'date' })
    validity: Date;

    @Column({ type: 'varchar', length: 5 })
    user_id: string;

    // * Relaciones
    @OneToOne(
        () => User,
        (user) => user.license
    )
    @JoinColumn({ name: 'user_id' })
    user: User;
}