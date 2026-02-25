import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { Bank } from "./bank.entity";
import { Employee } from "./employee";

@Entity({ name: 'banking_details' })
export class BankingDetails {

    @Column({ type: 'varchar', length: 18 })
    CLABE: string;

    @Column({ type: 'varchar', length: 24 })
    account_number: string;

    @PrimaryColumn({type: 'varchar', length: 5})
    user_id: string;
    
    @PrimaryColumn()
    bank_id: number;

    // * Relaciones
    @OneToOne(
        () => Employee,
        (employee) => employee.bankingDetails
    )
    @JoinColumn({ name: 'user_id' })
    employee: Employee;

    @ManyToOne(
        () => Bank,
        (bank) => bank.bankingDetails,
        {onDelete: 'NO ACTION'}
    )
    @JoinColumn({name: 'bank_id'})
    bank: Bank;
}