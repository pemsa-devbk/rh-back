import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Binnacle } from "./binnacle.entity";
import { Employee } from "./employee.entity";
import { EmployeeFiles } from "./employee_files.entity";
import { Rol } from "./roles.entity";

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
        select: false, nullable: true
    })
    password: string;

    // TODO: Verificar los niveles de rol
    @Column()
    role_id: number;

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

    @ManyToOne(
        () => Rol,
        (rol) => rol.users
    )
    @JoinColumn({ name: 'role_id' })
    rol: Rol;

    // @OneToMany(
    //     () => UserRole,
    //     (userRole) => userRole.user
    // )
    // userRoles: UserRole[];

    @OneToMany(
        () => EmployeeFiles,
        (employeeFiles) => employeeFiles.userUploaded
    )
    uploadedFiles: EmployeeFiles[];

}

