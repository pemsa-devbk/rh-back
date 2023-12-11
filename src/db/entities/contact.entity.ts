import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Contact{
    @PrimaryGeneratedColumn('increment')
    id:number;

    @Column()
    contact: string;

    @Column()
    type:number;

    @Column({
        nullable: true
    })
    notes: string;

    //Relaciones con el usuario:
    @ManyToOne(
        () => User,
        (user) => user.contacts
    )
    user: User;
    
}