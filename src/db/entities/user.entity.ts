import { Column, DeleteDateColumn, Entity, OneToMany, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Binnacle } from "./binnacle.entity";
import { Employee } from "./employee";
import { UserRole } from "./user_role.entity";

@Entity({ name: 'users' })
export class User {
    @PrimaryColumn({ length: 5, type: 'varchar' })
    user_id: string;

    @Column({
        type: 'varchar',
        length: 100
    })
    name: string;

    @Column({
        select: false
    })
    password: string;

    // TODO: Verificar los niveles de rol
    // @Column()
    // rol: string;

    @UpdateDateColumn()
    update_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

    // * Relaciones
    @OneToOne(
        () => Employee,
        (employee) => employee.user
    )
    employee: Employee;

    // * Bitacora de movimientos del usuario
    @OneToMany(
        () => Binnacle,
        (binnacle) => binnacle.modifiedUser,
    )
    binnacle: Binnacle[];

    // * Bitacora de los movimientos que ha hecho el usuario
    @OneToMany(
        () => Binnacle,
        (bitacora) => bitacora.modifierUser,
    )
    history: Binnacle[];

    @OneToMany(
        () => UserRole,
        (userRole) => userRole.user
    )
    userRoles: UserRole[];

}

