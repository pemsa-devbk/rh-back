import { existsSync, mkdirSync, rmSync } from "fs";
import { appDataSource } from "../db/dataBase";
import { Employee } from "../db/entities/employee.entity";
import { CreateEmployeeDTO } from "../Dto/user/createEmployee.dto";
import { join } from 'path';
import { Binnacle } from "../db/entities/binnacle.entity";
import { User } from "../db/entities/user.entity";
import { ValidStateMov } from "../types/enums/validMov";
import bcrypt from 'bcrypt';
import { Address } from "../db/entities/address.entity";
import { BankingDetails } from "../db/entities/banking_details.entity";
import { Contract } from "../db/entities/contract.entity";
import { EnterpriseInformation } from "../db/entities/enterprise_information.entity";
import { License } from "../db/entities/license.entity";
import { MedicalData } from "../db/entities/medical_data.entity";
import { PaginationDto } from "../Dto/pagination.dto";
import { Like } from "typeorm";
import { CustomError } from "../utils/error";

enum EmployeeQueryContext {
    FROM_ENTERPRISE = 'FROM_ENTERPRISE', // Desde /enterprises/:id/employees -> Office + department + area + position + employee
    FROM_OFFICE = 'FROM_OFFICE', // Desde offices/:id/employees -> department + area + position + employee
    FROM_DEPARTMENT = 'FROM_DEPARTMENT', // Desde departments/:id/employees -> area + position + employee
    FROM_AREA = 'FROM_AREA', // Desde areas/:id/employees -> position + employee
    FROM_POSITION = 'FROM_POSITION', // Desde positions/:id/employees -> employee
    FROM_COURSE = 'FROM_COURSE', // Desde course/:id/courses -> employee
    FROM_GENERAL = 'FROM_GENERAL' // Desde /employees -> enterpise + Office + department + area + position + employee
}

export class EmployeeService {

    private dir = join(__dirname, "..", "..", "uploads", 'employees');
    constructor(
        private readonly repository = appDataSource.getRepository(Employee)
    ) { }

    public create(createDTO: CreateEmployeeDTO, userSession: User) {
        const { address, banking, contract, enterpiseInformation, license, medical, user_id, name, password, ...employeeDTO } = createDTO;
        return this.repository.manager.transaction(async (transactionalEntityManager) => {
            if (!existsSync(this.dir)) mkdirSync(this.dir);
            // TODO: Password
            const passbcrypt = bcrypt.hashSync('password', 10);
            const user = await transactionalEntityManager.save(User, { user_id, name, password: passbcrypt });
            const employee = await transactionalEntityManager.save(Employee, { ...employeeDTO, user_id });

            // * Crear el movimiento
            await transactionalEntityManager.insert(Binnacle, {
                modified_user_id: user_id,
                modifier_user_id: userSession.user_id,
                type: ValidStateMov.alta
            });
            // * Verificar si vienen los campos relacionados
            if (address)
                await transactionalEntityManager.insert(Address, { ...address, employee_id: user.user_id });
            if (banking)
                await transactionalEntityManager.insert(BankingDetails, { ...banking, employee_id: user.user_id });
            if (contract)
                await transactionalEntityManager.insert(Contract, { ...contract, employee_id: user.user_id });
            if (enterpiseInformation)
                await transactionalEntityManager.insert(EnterpriseInformation, { ...enterpiseInformation, employee_id: user.user_id });
            if (license)
                await transactionalEntityManager.insert(License, { ...license, employee_id: user.user_id });
            if (medical)
                await transactionalEntityManager.insert(MedicalData, { ...medical, employee_id: user.user_id });

            const pathUser = join(this.dir, user_id);
            // * Eliminar en caso de que exista
            if (existsSync(pathUser)) rmSync(pathUser, { recursive: true });
            // * Crear directorios
            mkdirSync(pathUser);
            mkdirSync(pathUser + '/docs')
            mkdirSync(pathUser + '/holidays')
            mkdirSync(pathUser + '/courses')

            return employee;
        });
    }

    public async getAll(pagination: PaginationDto) {
        const { skip, take, search } = pagination;
        const query = this.getQuery();
        if (search) query.where("user.name LIKE :search", { search: `%${search}%` });
        const [total, employees] = await Promise.all([
            this.repository.count({
                where: search && { user: { name: Like(`%${search}%`) } }
            }),
            query.take(take).skip(skip).getRawMany()
        ]);
        return [employees, total];
    }

    public async getOne(user_id: string) {
        return await this.findOneOrFail(user_id);
    }

    public async update(user_id: string) {
        const user = await this.findOneOrFail(user_id);
        return { ...user };
    }

    public async delete(user_id: string) {
        const user = await this.findOneOrFail(user_id);
        await this.repository.delete({ user_id });
        return user;
    }

    public async getByPosition(position_id: number, pagination: PaginationDto) {
        const { skip, take, search } = pagination;
        const query = this.getQuery(EmployeeQueryContext.FROM_POSITION);
        if (search) query.where("user.name LIKE :search", { search: `%${search}%` });
        const [total, employees] = await Promise.all([
            this.repository.count({
                where: search ? { user: { name: Like(`%${search}%`) }, position_id } : { position_id }
            }),
            query.andWhere('employee.position_id = :position_id', { position_id }).take(take).skip(skip).getRawMany()
        ]);
        return [employees, total];
    }

    public async getByArea(area_id: number, pagination: PaginationDto) {
        const { skip, take, search } = pagination;
        const query = this.getQuery(EmployeeQueryContext.FROM_AREA);
        if (search) query.where("user.name LIKE :search", { search: `%${search}%` });
        const [total, employees] = await Promise.all([
            this.repository.count({
                where: search ? { user: { name: Like(`%${search}%`) }, position: { area_id } } : { position: { area_id } }
            }),
            query.andWhere('position.area_id = :area_id', { area_id }).take(take).skip(skip).getRawMany()
        ]);
        return [employees, total];
    }

    public async getByDepartment(department_id: number, pagination: PaginationDto) {
        const { skip, take, search } = pagination;
        const query = this.getQuery(EmployeeQueryContext.FROM_DEPARTMENT);
        if (search) query.where("user.name LIKE :search", { search: `%${search}%` });
        const [total, employees] = await Promise.all([
            this.repository.count({
                where: search ? { user: { name: Like(`%${search}%`) }, position: { area: { department_id } } } : { position: { area: { department_id } } }
            }),
            query.andWhere('area.department_id = :department_id', { department_id }).take(take).skip(skip).getRawMany()
        ]);
        return [employees, total];
    }

    public async getByOffice(office_id: number, pagination: PaginationDto) {
        const { skip, take, search } = pagination;
        const query = this.getQuery(EmployeeQueryContext.FROM_OFFICE);
        if (search) query.where("user.name LIKE :search", { search: `%${search}%` });
        const [total, employees] = await Promise.all([
            this.repository.count({
                where: search ? { user: { name: Like(`%${search}%`) }, position: { area: { department: { office_id } } } } : { position: { area: { department: { office_id } } } }
            }),
            query.andWhere('department.office_id = :office_id', { office_id }).take(take).skip(skip).getRawMany()
        ]);
        return [employees, total];
    }

    public async getByEnterprise(enterprise_id: string, pagination: PaginationDto) {
        const { skip, take, search } = pagination;
        const query = this.getQuery(EmployeeQueryContext.FROM_ENTERPRISE);
        if (search) query.where("user.name LIKE :search", { search: `%${search}%` });
        const [total, employees] = await Promise.all([
            this.repository.count({
                where: search ? { user: { name: Like(`%${search}%`) }, position: { area: { department: { office: { enterprise_id } } } } } : { position: { area: { department: { office: { enterprise_id } } } } }
            }),
            query.andWhere('office.enterprise_id = :enterprise_id', { enterprise_id }).take(take).skip(skip).getRawMany()
        ]);
        return [employees, total];
    }

    public async getByCourse(course_id: number, pagination: PaginationDto) {
        const { skip, take, search } = pagination;
        const query = this.getQuery(EmployeeQueryContext.FROM_COURSE);
        if (search) query.where("user.name LIKE :search", { search: `%${search}%` });
        const [total, employees] = await Promise.all([
            this.repository.count({
                where: search ? { user: { name: Like(`%${search}%`) }, courseEmployees: { course_id } } : { courseEmployees: { course_id } }
            }),
            query.andWhere('courseEmployee.course_id = :course_id', { course_id }).take(take).skip(skip).getRawMany()
        ]);
        return [employees, total];
    }

    private getQuery(context: EmployeeQueryContext = EmployeeQueryContext.FROM_GENERAL) {
        const query = this.repository.createQueryBuilder('employee')
            .select(['employee.user_id as user_id', 'employee.gender as gender', 'employee.birthdate as birthdate', 'employee.curp as curp', 'employee.status as status', 'employee.rfc as rfc', 'employee.cuip as cuip', 'employee.num_children as num_children', 'employee.vacation_days as vacation_days', 'employee.boss_id as boss_id', 'employee.have_uniform as have_uniform', 'employee.num_infonavit as num_infonavit', 'employee.marital_status as marital_status', 'employee.place_registration as place_registration', 'employee.salary as salary', 'employee.cp_csf as cp_csf', 'employee.date_entry as date_entry', 'employee.position_id as position_id'])
            .leftJoin('employee.user', 'user')
            .addSelect('user.name', 'name')
            .addSelect('user.update_at', 'update_at')
            .addSelect('user.deleted_at', 'deleted_at')
        switch (context) {
            case EmployeeQueryContext.FROM_GENERAL:
                // devolver enterprise, office, department, area, position
                query.leftJoin('employee.position', 'position')
                    .leftJoin('position.area', 'area')
                    .leftJoin('area.department', 'department')
                    .leftJoin('department.office', 'office')
                    .leftJoin('office.enterprise', 'enterprise')
                    .addSelect('position.name', 'position_name')
                    .addSelect('area.area_id', 'area_id')
                    .addSelect('area.name', 'area_name')
                    .addSelect('department.department_id', 'department_id')
                    .addSelect('department.name', 'department_name')
                    .addSelect('office.office_id', 'office_id')
                    .addSelect('office.name', 'office_name')
                    .addSelect('enterprise.enterprise_id', 'enterprise_id')
                    .addSelect('enterprise.name', 'enterprise_name');
                break;
            case EmployeeQueryContext.FROM_ENTERPRISE:
                // devolver office, department, area, position
                query.leftJoin('employee.position', 'position')
                    .leftJoin('position.area', 'area')
                    .leftJoin('area.department', 'department')
                    .leftJoin('department.office', 'office')
                    .addSelect('position.name', 'position_name')
                    .addSelect('area.area_id', 'area_id')
                    .addSelect('area.name', 'area_name')
                    .addSelect('department.department_id', 'department_id')
                    .addSelect('department.name', 'department_name')
                    .addSelect('office.office_id', 'office_id')
                    .addSelect('office.name', 'office_name');
                break;
            case EmployeeQueryContext.FROM_OFFICE:
                // Devolver department, area, position
                query.leftJoin('employee.position', 'position')
                    .leftJoin('position.area', 'area')
                    .leftJoin('area.department', 'department')
                    .addSelect('position.name', 'position_name')
                    .addSelect('area.area_id', 'area_id')
                    .addSelect('area.name', 'area_name')
                    .addSelect('department.department_id', 'department_id')
                    .addSelect('department.name', 'department_name');
                break;
            case EmployeeQueryContext.FROM_DEPARTMENT:
                // Devolver area, position
                query.leftJoin('employee.position', 'position')
                    .leftJoin('position.area', 'area')
                    .addSelect('position.name', 'position_name')
                    .addSelect('area.area_id', 'area_id')
                    .addSelect('area.name', 'area_name');
                break;
            case EmployeeQueryContext.FROM_AREA:
                // devolver position
                query.leftJoin('employee.position', 'position')
                    .addSelect('position.name', 'position_name');
                break;
            case EmployeeQueryContext.FROM_COURSE:
                // devolver position
                query.leftJoin('employee.courseEmployees', 'courseEmployee')
                    .addSelect('courseEmployee.have_proof', 'have_proof')
                break;
            default: break;
        }
        return query;

    }

    private async findOneOrFail(user_id: string) {
        const user = await this.getQuery(EmployeeQueryContext.FROM_AREA)
            .where('employee.user_id = :user_id', { user_id })
            .getRawOne();
        if (!user) throw new CustomError("Empleado no existente", 404);
        return user;
    }
}