import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Signature } from "./signature.entity";
import { Office } from "./office.entity";

@Entity({name: 'enterprises'})
export class Enterprise {
    @PrimaryGeneratedColumn('uuid')
    enterprise_id: string;

    @Column({type: 'varchar', length: 300 })
    name: string;

    @Column({ type: 'varchar', length: 400 })
    address: string;

    // * Relations 
    @OneToOne(
        () => Signature, (signature) => signature.enterprise
    )
    signature: Signature;

    @OneToMany(
        () => Office,
        (office) => office.enterprise
    )
    offices: Office[];
}