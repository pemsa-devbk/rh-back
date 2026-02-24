import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'contacts' })
export class Contact {
    @PrimaryGeneratedColumn('increment')
    contact_id: number;

    @Column({ type: 'varchar', length: 100 })
    contact: string;

    // ? Definir tipos (1. correo, 2. telefono)
    @Column({
        type: "tinyint"
    })
    type: number;

    @Column({ nullable: true, type: 'varchar', length: 200 })
    notes: string;

    @Column({ type: 'varchar', length: 5 })
    user_id: string;

    //Relaciones con el usuario:
    @ManyToOne(
        () => User,
        (user) => user.contacts,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'user_id' })
    user: User;
}