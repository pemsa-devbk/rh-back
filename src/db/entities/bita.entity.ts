import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Mov } from "./movs.entity";

@Entity()
export class Bitacora{
    @PrimaryGeneratedColumn('increment')
    id: number;

    @CreateDateColumn()
    createdAt: Date; 


    //Relaciones:
    @ManyToOne(
        () => User,
        (user) => user.misMovs, 
    )
    userModificado: User;

    @ManyToOne(
        () => User,
        (user) => user.movRealizados,
    )
    createdBy: User;

    @ManyToOne(
        () => Mov,
        (mov) => mov.bitacoras,
        {onDelete: 'CASCADE'}
    )
    movType: Mov;
}

