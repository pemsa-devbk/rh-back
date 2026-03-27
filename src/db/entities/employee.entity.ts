import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Address } from "./address.entity";
import { User } from "./user.entity";
import { EnterpriseInformation } from "./enterprise_information.entity";
import { MedicalData } from "./medical_data.entity";
import { License } from "./license.entity";
import { BankingDetails } from "./banking_details.entity";
import { Contract } from "./contract.entity";
import { Contact } from "./contact.entity";
import { HolidayRequest } from "./holidays_request";
import { SystemConfiguration } from "./system_configuration";
import { Area } from "./area.entity";
import { Department } from "./department.entity";
import { CourseEmployee } from "./course_employee.entity";
import { Position } from "./position.entity";
import { EmployeeFiles } from "./employee_files.entity";

@Entity({ name: 'employees' })
export class Employee {
    @PrimaryColumn({ length: 5, type: 'varchar' })
    user_id: string;

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
        default: 1
    })
    status: number;

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
    cuip: string;

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
    boss_id: string;

    @Column({ type: 'bit', default: false })
    have_uniform: boolean;

    @Column({ type: 'varchar', nullable: true, length: 10 })
    num_infonavit: string;

    @Column({ type: 'tinyint' })
    marital_status: number;

    @Column({ type: 'varchar', length: 200 })
    place_registration: string;

    @Column({ type: 'int' })
    salary: number;

    @Column({ type: 'char', length: 5 })
    cp_csf: string; // Codigo postal de constancia de situacion fiscal 

    @Column({
        type: 'date',
    })
    date_entry: Date;

    @Column()
    position_id: number;

    // * Relaciones:

    @OneToOne(
        () => User,
        (user) => user.employee,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToOne(
        () => Address,
        (address) => address.employee
    )
    address: Address;

    @OneToOne(
        () => EnterpriseInformation,
        (enterpriseInformation) => enterpriseInformation.employee
    )
    enterpriseInformation: EnterpriseInformation;

    @OneToOne(
        () => MedicalData,
        (medicalData) => medicalData.employee
    )
    medicalData: MedicalData;

    @OneToOne(
        () => License,
        (license) => license.employee
    )
    license: License;

    @OneToOne(
        () => BankingDetails,
        (bankingDetails) => bankingDetails.employee
    )
    bankingDetails: BankingDetails;

    @OneToMany(
        () => Contract,
        (contract) => contract.employee
    )
    contracts: Contract[];

    @OneToMany(
        () => Employee,
        (employee) => employee.boss,
    )
    employeesInCharge: Employee[];

    @ManyToOne(
        () => Employee,
        (employee) => employee.employeesInCharge,
        // { onDelete: 'SET NULL' }
    )
    @JoinColumn({ name: 'boss_id' })
    boss: Employee;

    @OneToMany(
        () => Contact,
        (contact) => contact.employee,
    )
    contacts: Contact[];

    @OneToMany(
        () => HolidayRequest,
        (holidays) => holidays.employee
    )
    holidays: HolidayRequest[];

    @OneToMany(
        () => SystemConfiguration,
        (system) => system.employee
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
        () => CourseEmployee,
        (courseEmployee) => courseEmployee.employee
    )
    courseEmployees: CourseEmployee[];

    @OneToMany(
        () => EmployeeFiles,
        (employeeFiles) => employeeFiles.employee
    )
    employeeFiles: EmployeeFiles[];


    @ManyToOne(
        () => Position,
        (position) => position.employees,
        { onDelete: 'NO ACTION' }
    )
    @JoinColumn({ name: 'position_id' })
    position: Position;
}