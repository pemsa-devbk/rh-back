import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Municipality } from './municipaly.entity';
import { Settlement } from "./settlement.entity";
import { Address } from "./address.entity";

@Entity({name: 'colonies'})
export class Colony{
    @PrimaryGeneratedColumn('increment')
    colony_id: number;

    @Index()
    @Column({type: 'char', length: 5})
    postal_code: string;

    @Column({type: 'varchar', length: 100})
    name: string;

    @Column({type: 'char', length: 2})
    code_settlement: string;

    @Column({type: 'char', length: 6})
    municipality_id: string;

    // * Relaciones

    @OneToMany(
        () => Address,
        (address) => address.colony
    )
    addresses: Address[];

    @ManyToOne(
        () => Municipality,
        (municipality) => municipality.colonies,
        {onDelete: 'CASCADE'}
    )
    @JoinColumn({name: 'municipality_id'})
    municipality: Municipality;

    @ManyToOne(
        () => Settlement,
        (settlement) => settlement.colonies,
        {onDelete: 'CASCADE'}
    )
    @JoinColumn({name: 'code_settlement'})
    settlement: Settlement;
}