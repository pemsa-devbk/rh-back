import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { State } from "./state.entity";
import { Colony } from "./colony.entity";


@Entity({name: 'municipalities'})
export class Municipality{

    @PrimaryColumn({type: 'char', length: 6})
    municipality_id: string;

    @Column({type: 'varchar', length: 100})
    name: string;

    @Column({type: 'char', length: 3})
    code_municipality: string;

    @Column({type: 'char', length: 2})
    code_state: string;

    // * Relaciones

    @OneToMany(
        () => Colony,
        (colony) => colony.municipality
    )
    colonies: Colony[];

    @ManyToOne(
        () => State,
        (state) => state.municipalities,
        { onDelete: 'CASCADE'}
    )
    @JoinColumn({name: 'code_state'})
    state: State;

}