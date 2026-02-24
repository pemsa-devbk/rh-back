import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'contracts' })
export class Contract {
    @PrimaryGeneratedColumn('increment')
    contract_id: number;
    // TODO posible enum
    @Column({ type: 'tinyint'})
    type: number;

    @Column({ type: 'date', nullable: true })
    validity: Date;

    @Column({ type: 'varchar', length: 5 })
    user_id: string;
    
    @CreateDateColumn()
    created_at: Date;

    // * Relaciones
    @ManyToOne(
        () => User,
        (user) => user.contracts,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'user_id' })
    user: User;
}