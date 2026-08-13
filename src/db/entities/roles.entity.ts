import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "./user_role.entity";
import { User } from "./user.entity";

@Entity({name: 'roles'})
export class Rol{
    @PrimaryGeneratedColumn('increment')
    role_id: number;

    @Column({type: 'varchar', length: 50})
    name: string;

    @Column({type: 'tinyint', nullable: true})
    level: number;

    @OneToMany(
        () => User,
        (user) => user.rol
    )
    users: User[];

    // @OneToMany(
    //     () => UserRole,
    //     (userRole) => userRole.rol
    // )
    // userRoles: UserRole[];
}