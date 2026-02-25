import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "./user_role.entity";

@Entity({name: 'roles'})
export class Rol{
    @PrimaryGeneratedColumn('identity')
    role_id: number;

    @Column({type: 'varchar', length: 50})
    name: string;

    @OneToMany(
        () => UserRole,
        (userRole) => userRole.rol
    )
    userRoles: UserRole[];
}