import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BankingDetails } from "./banking_details.entity";

@Entity({name: 'banks'})
export class Bank{

    @PrimaryGeneratedColumn('increment')
    bank_id: number;

    @Column({type: 'varchar', length: 100})
    name: string;

    @Column({type: 'varchar', length: 10})
    institution_key: string;

    // * Relaciones
    @OneToMany(
        () => BankingDetails,
        (bankingDetails) => bankingDetails.bank
    )
    bankingDetails: BankingDetails[];
}