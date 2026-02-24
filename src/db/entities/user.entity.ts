import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, UpdateDateColumn } from "typeorm";
import { Binnacle } from "./binnacle.entity";
import { Contact } from "./contact.entity";
import { HolidayRequest } from "./holidays_request";
import { SystemConfiguration } from "./system_configuration";
import { Area } from "./area.entity";
import { Position } from './position.entity';
import { CourseUser } from "./course_user.entity";
import { Department } from "./department.entity";
import { Address } from "./address.entity";
import { EnterpriseInformation } from "./enterprise_information.entity";
import { MedicalData } from "./medical_data.entity";
import { License } from "./license.entity";
import { Contract } from "./contract.entity";
import { BankingDetails } from "./banking_details.entity";

@Entity({ name: 'users' })
export class User {
    @Column({
        primary: true,
        length: 5,
        type: 'varchar'
    })
    user_id: string;

    @Column({
        type: 'varchar',
        length: 100
    })
    name: string;

    @Column({
        type: 'char',
        length: 1,
    })
    gender: string;

    @Column({
        type: 'date',
    })
    birthdate: Date;

    @Column({
        type: 'varchar',
        unique: true,
        length: 18
    })
    curp: string;

    @Column({
        type: 'varchar',
        unique: true,
        length: 13
    })
    rfc: string;

    @Column({
        type: 'varchar',
        nullable: true
    })
    cuip: string

    @Column({
        select: false
    })
    password: string;

    // TODO: Verificar los niveles de rol
    @Column()
    rol: string;

    @Column({
        default: 1
    })
    status: number;

    @Column({
        type: 'tinyint',
        default: 0
    })
    num_children: number;

    @Column({
        type: 'smallint',
        default: 0
    })
    vacation_days: number;

    @Column({ nullable: true, type: 'varchar', length: 5 })
    user_chief_id: string;

    @Column({ type: 'bit', default: false })
    have_uniform: boolean;

    @Column({ type: 'varchar', nullable: true, length: 10})
    num_infonavit: string;

    @Column({type: 'tinyint'})
    marital_status: number;

    @Column({type: 'varchar', length: 200})
    place_registration: string;

    @Column({type: 'int'})
    salary: number;

    @Column({type: 'char', length: 5})
    cp_csf: string; // Codigo postal de constancia de situacion fiscal 

    @Column({
        type: 'date',
    })
    date_entry: Date;

    @UpdateDateColumn()
    update_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

    @Column()
    position_id: number;

    // * Relaciones:
    @OneToOne(
        () => Address,
        (address) => address.user
    )
    address: Address;

    @OneToOne(
        () => EnterpriseInformation,
        (enterpriseInformation) => enterpriseInformation.user
    )
    enterpriseInformation: EnterpriseInformation;

    @OneToOne(
        () => MedicalData,
        (medicalData) => medicalData.user
    )
    medicalData: MedicalData;

    @OneToOne(
        () => License,
        (license) => license.user
    )
    license: License;

    @OneToOne(
        () => BankingDetails,
        (bankingDetails) => bankingDetails.user
    )
    bankingDetails: BankingDetails;

    @OneToMany(
        () => Contract,
        (contract) => contract.user
    )
    contracts: Contract[];

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
        () => User,
        (user) => user.userChief,
    )
    usersInCharge: User[];

    @ManyToOne(
        () => User,
        (user) => user.usersInCharge,
        // { onDelete: 'SET NULL' }
    )
    @JoinColumn({ name: 'user_chief_id' })
    userChief: User;

    @OneToMany(
        () => Contact,
        (contact) => contact.user,
    )
    contacts: Contact[];

    @OneToMany(
        () => HolidayRequest,
        (holidays) => holidays.user
    )
    holidays: HolidayRequest[];

    @OneToMany(
        () => SystemConfiguration,
        (system) => system.user
    )
    specialConfig: SystemConfiguration[];

    @OneToMany(
        () => Area,
        (area) => area.responsibleUser
    )
    areasInCharge: Area[];

    @OneToMany(
        () => Department,
        (department) => department.responsibleUser
    )
    departmentsInCharge: Department[];

    @OneToMany(
        () => CourseUser,
        (courseUser) => courseUser.user
    )
    courseUsers: CourseUser[];


    @ManyToOne(
        () => Position,
        (position) => position.users,
        { onDelete: 'NO ACTION' }
    )
    @JoinColumn({ name: 'position_id' })
    position: Position;

}

