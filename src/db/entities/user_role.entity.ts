import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Rol } from './roles.entity';
import { User } from "./user.entity";

@Entity({name: 'user_roles'})
export class UserRole{
    @PrimaryColumn()
    role_id: number;

    @PrimaryColumn({ length: 5, type: 'varchar' })
    user_id: string;

    @ManyToOne(
        () => Rol,
        (rol) => rol.userRoles
    )
    @JoinColumn({name: 'role_id'})
    rol: Rol;

    @ManyToOne(
        () => User,
        (user) => user.userRoles
    )
    @JoinColumn({name: 'user_id'})
    user: User;
}