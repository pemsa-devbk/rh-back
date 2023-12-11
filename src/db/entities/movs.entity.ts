import { Column, Entity, OneToMany } from "typeorm";
import { Bitacora } from "./bita.entity";

@Entity()
export class Mov{
   @Column({primary: true})
    id:number;

    @Column()
    nameMov: string;

    //Relaciones
    @OneToMany(
        () => Bitacora,
        (bitacora) => bitacora.movType
    )
    bitacoras: Bitacora[];

}