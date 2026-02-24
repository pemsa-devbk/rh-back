import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";
import { Bank } from "./bank.entity";

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
        () => User,
        (user) => user.bankingDetails
    )
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(
        () => Bank,
        (bank) => bank.bankingDetails,
        {onDelete: 'NO ACTION'}
    )
    @JoinColumn({name: 'bank_id'})
    bank: Bank;
}