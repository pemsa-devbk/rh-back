import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, UpdateDateColumn } from "typeorm";
import { Bitacora } from "./bita.entity";
import { State } from "./state.entity";
import { Contact } from "./contact.entity";

@Entity ('users')
export class User{
    @Column({
        primary:true,
        length: 100
    })
    id: string;

    @Column({
        type: 'varchar',
        length: 100
    })
    name: string;

    @Column({
        type:'date',
        nullable: true
    })
    fnacimiento: Date;

    @Column({
        nullable: true
    })
    urlPhoto: string;

    @Column({
        select: false
    })
    password: string;

    @Column()
    rol:string;

    @Column({
        default: true
    })
    status:boolean;

    @UpdateDateColumn()
    upDateAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    
    //Relaciones:
    @OneToMany(
        () => Bitacora,
        (bitacora) => bitacora.userModificado
    )
    misMovs: Bitacora[];

    @OneToMany(
        () => Bitacora,
        (bitacora) => bitacora.createdBy
    )
    movRealizados: Bitacora[];
    
    //
    @ManyToOne(
        () => State,
        (state) => state.users
    )
    state: State;

    @OneToMany(
        () => User,
        (user) => user.userChief
    )
    usersInCharge: User[];

    @ManyToOne(
        () => User,
        (user) => user.usersInCharge
    )
    userChief: User;

    @OneToMany(
        () => Contact,
        (contact) => contact.user
    )
    contacts: Contact[];
}

