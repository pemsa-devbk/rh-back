import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({name: 'system_configuration'})
export class SystemConfiguration{
    @PrimaryColumn('varchar')
    key: string;

    @Column({type: 'varchar', length: 200})
    description: string;

    @Column({type: 'varchar', length: 5, nullable: true})
    user_id: string | null;

    @ManyToOne(
        () => User,
        (user) => user.specialConfig,
        {nullable: true, onDelete: 'SET NULL'}
    )
    @JoinColumn({name: 'user_id'})
    user: User;
}