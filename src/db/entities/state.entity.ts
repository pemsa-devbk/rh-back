import { Column, Entity, OneToMany } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class State{
    @Column({
        primary: true
    })
    id: number;

    @Column()
    name: string;

    //Relaciones que tiene con usuario:
    @OneToMany(
        () => User,
        (user) =>user.region
    )
    users: User[]
}