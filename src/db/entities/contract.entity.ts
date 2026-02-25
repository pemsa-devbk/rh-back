import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Employee } from "./employee";

@Entity({ name: 'contracts' })
export class Contract {
    @PrimaryGeneratedColumn('increment')
    contract_id: number;
    
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
        () => Employee,
        (employee) => employee.contracts,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'user_id' })
    employee: Employee;
}