import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Colony } from "./colony.entity";

@Entity({name: 'settlements'})
export class Settlement{
    @PrimaryColumn({type: 'char', length: 2})
    code_settlement: string;

    @Column({type: 'varchar', length: 50})
    name: string;

    // * Relaciones
    @OneToMany(
        () => Colony,
        (colony) => colony.settlement
    )
    colonies: Colony[];
}