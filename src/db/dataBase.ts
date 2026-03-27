import { DataSource } from "typeorm";
import { enviroment } from "../config/enviroment";
import { User } from "./entities/user.entity";
import { Binnacle } from "./entities/binnacle.entity";
import { Contact } from "./entities/contact.entity";
import { HolidaysConfig } from "./entities/holidays_config";
import { HolidayRequest } from "./entities/holidays_request";
import { HolidayDays } from "./entities/holidays_days";
import { SystemConfiguration } from "./entities/system_configuration";
import { Office } from "./entities/office.entity";
import { Area } from "./entities/area.entity";
import { Position } from "./entities/position.entity";
import { Signature } from "./entities/signature.entity";
import { Enterprise } from "./entities/enterprise.entity";
import { Course } from "./entities/course.entity";
import { CourseEmployee } from "./entities/course_employee.entity";
import { Address } from "./entities/address.entity";
import { BankingDetails } from "./entities/banking_details.entity";
import { Colony } from "./entities/colony.entity";
import { Contract } from "./entities/contract.entity";
import { Department } from "./entities/department.entity";
import { EnterpriseInformation } from "./entities/enterprise_information.entity";
import { License } from "./entities/license.entity";
import { MedicalData } from "./entities/medical_data.entity";
import { Municipality } from "./entities/municipaly.entity";
import { Settlement } from "./entities/settlement.entity";
import { State } from "./entities/state.entity";
import { Bank } from "./entities/bank.entity";
import { Rol } from "./entities/roles.entity";
import { UserRole } from "./entities/user_role.entity";
import { Employee } from "./entities/employee.entity";
import { File } from "./entities/file.entity";
import { EmployeeFiles } from "./entities/employee_files.entity";

export const appDataSource = new DataSource ({
    type:'mssql',
    host: enviroment.HOST,
    port: 1433, 
    username: enviroment.USERNAME,
    password: enviroment.PASSWORD,
    database: enviroment.DATABASE,
    synchronize: true, 
    // logging: true,
    entities: [Address, Area, Bank, BankingDetails, Binnacle, Colony, Contact, Contract, CourseEmployee, Course, Department, EnterpriseInformation, Enterprise, Employee, HolidaysConfig, HolidayDays, HolidayRequest, License, MedicalData, Municipality, Office, Position, Rol, Settlement, Signature, State, SystemConfiguration, User, UserRole, File, EmployeeFiles],
    extra: {
        trustServerCertificate:true
    }
})

