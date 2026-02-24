import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({name: 'binnacle'})
export class Binnacle{
    @PrimaryGeneratedColumn('increment')
    binnacle_id: number;

    // ? Alta, Baja, Reintegro, Edicion, Vacaciones
    @Column({
        type: 'varchar',
        length: 50
    })
    type: string;

    @Column({
        type: 'varchar',
        nullable: true
    })
    comment: string;

    @CreateDateColumn()
    created_at: Date; 

    @Column({type: 'varchar', length: 5}) // * Para el usuario modificado
    modified_user_id: string;

    @Column({type: 'varchar', length: 5, nullable: true}) // * Para el usuario que modifico
    modifier_user_id: string;

    // * Relaciones:
    @ManyToOne(
        () => User,
        (user) => user.binnacle, 
        { onDelete: 'CASCADE'}
    )
    @JoinColumn({name: 'modified_user_id'})
    modifiedUser: User;

    // * Usuario que realizo el movimiento
    @ManyToOne(
        () => User,
        (user) => user.history,
        { onDelete: 'NO ACTION'}
    )
    @JoinColumn({name: 'modifier_user_id'})
    modifierUser: User;

}
