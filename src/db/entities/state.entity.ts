import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Municipality } from "./municipaly.entity";

@Entity({name: 'states'})
export class State {
    
    @PrimaryColumn({type: 'char', length: 2})
    code_state: string;

    @Column({ type: 'varchar', length: 100})
    name: string;

    // * Relaciones
    @OneToMany(
        () => Municipality,
        (municipality) => municipality.state
    )
    municipalities: Municipality[];
}