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
import { UpdateEmployeeDTO, UpdatePasswordDTO } from "../Dto/user/updateEmployee.dto";
import { StatusUser } from "../types/enums/status_user";
import { ColumnTypeMap } from "../types/search_type";
import { applyQueryFilters2 } from "../utils/applySearch";

enum EmployeeQueryContext {
    FROM_ENTERPRISE = 'FROM_ENTERPRISE', // Desde /enterprises/:id/employees -> Office + department + area + position + employee
    FROM_OFFICE = 'FROM_OFFICE', // Desde offices/:id/employees -> department + area + position + employee
    FROM_DEPARTMENT = 'FROM_DEPARTMENT', // Desde departments/:id/employees -> area + position + employee
    FROM_AREA = 'FROM_AREA', // Desde areas/:id/employees -> position + employee
    FROM_POSITION = 'FROM_POSITION', // Desde positions/:id/employees -> employee
    FROM_COURSE = 'FROM_COURSE', // Desde course/:id/courses -> employee
    FROM_GENERAL = 'FROM_GENERAL', // Desde /employees -> enterpise + Office + department + area + position + employee
}

const EMPLOYEE_COLUMNS_TYPES: ColumnTypeMap<Employee> = {
    // * entidad principal
    name: { type: 'text', column: 'user.name', default: 'like' },
    salary: {type: 'number', column: 'employee.salary', default: 'eq'},
    birthdate: { type: 'date', column: 'employee.birthdate', default: 'eq' },
    department_name: { type: 'text', column: 'department.name', default: 'like' },
    area_name: { type: 'text', column: 'area.name', default: 'like' },
    // valid_mime_types: { type: 'text', alias: 'file' },
    // description: { type: 'text', alias: 'file' },
    // created_at: { type: 'date', alias: 'file' },
    // is_active: { type: 'boolean', alias: 'file' },
    // is_required: { type: 'boolean', alias: 'file' }
};
// TODO Al crear el usuario crear la firma de correo y verificar contraseña
export class EmployeeService {

    private dir = join(__dirname, "..", "..", "uploads", 'employees');
    constructor(
        private readonly repository = appDataSource.getRepository(Employee)
    ) { }

    public create(createDTO: CreateEmployeeDTO, userSession: User) {
        const { address, banking, contract, enterpiseInformation, license, medical, user_id, role_id, name, password, ...employeeDTO } = createDTO;
        return this.repository.manager.transaction(async (transactionalEntityManager) => {
            if (!existsSync(this.dir)) mkdirSync(this.dir);
            const passbcrypt = bcrypt.hashSync('password', 10);
            const user = await transactionalEntityManager.save(User, { user_id, name, password: passbcrypt, role_id });
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

    public async getAll(pagination: any) {
        const query = this.getQuery();
        applyQueryFilters2(query, pagination, EMPLOYEE_COLUMNS_TYPES)
        console.log(query.getQuery())
        const emp = await query.getRawMany();
        return [emp, 10];
        const { skip, take, search } = pagination;
        if (search) query.where("user.name LIKE :search", { search: `%${search}%` });
        const [total, employees] = await Promise.all([
            this.repository.count({
                where: search && { user: { name: Like(`%${search}%`) } }
            }),
            query.take(take).skip(skip).getRawMany()
        ]);
        return [employees, total];
    }

    public async getOne(employee_id: string) {
        return await this.getQuery().where('employee.user_id = :employee_id', { employee_id }).getRawOne();
    }

    public async update(employee_id: string, updateDTO: UpdateEmployeeDTO, userSession: User) {
        const { user_id, name, ...employeeDTO } = updateDTO;
        await this.findOneOrFail(employee_id);
        await this.repository.manager.transaction(async (transactionalEntityManager) => {
            if (!existsSync(this.dir)) mkdirSync(this.dir);

            await transactionalEntityManager.update(User, { user_id: employee_id }, { name });
            await transactionalEntityManager.update(Employee, { user_id: employee_id }, { ...employeeDTO });

            // * Crear el movimiento
            await transactionalEntityManager.insert(Binnacle, {
                modified_user_id: employee_id,
                modifier_user_id: userSession.user_id,
                type: ValidStateMov.edicion
            });

            // const pathUser = join(this.dir, employee_id);
            // // * verificar si existe y cambio numero de empleado
            // if (existsSync(pathUser) && employee_id !== user_id) renameSync(pathUser, join(this.dir, user_id));

        });
        return this.getOne(employee_id);
    }

    public async toggleStatus(employee_id: string, userSession: User){
        const employee = await this.findOneOrFail(employee_id);
        if(employee.status === StatusUser.vacaciones) throw new CustomError(`Espere a que el periodo de vacaciones del empleado ${employee.name} termine`, 401);
        return this.repository.manager.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.update(Employee, {employee_id}, {status: (employee.status === StatusUser.activo) ? StatusUser.baja : StatusUser.activo});
            await transactionalEntityManager.insert(Binnacle, {
                modified_user_id: employee_id,
                modifier_user_id: userSession.user_id,
                type: ValidStateMov.alta
            });
            return employee;
        })
    }

    public async changePassword(passwordDTO: UpdatePasswordDTO, userSession: User){
        const {old_password, password} = passwordDTO;
        if(!bcrypt.compareSync(password, userSession.password)) throw new CustomError("La contraseña no coincide", 401);
        return this.repository.manager.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.update(User, {user_id: userSession.user_id}, { password: bcrypt.hashSync(old_password, 10)});

            await transactionalEntityManager.insert(Binnacle, {
                modified_user_id: userSession.user_id,
                modifier_user_id: userSession.user_id,
                type: ValidStateMov.edicion,
                comment: 'Actualización de contraseña'
            });
            return 'La contraseña se actualizo correctamente';
        })
    }

    public async myInfo(userSession: User){
        return  this.getQuery(EmployeeQueryContext.FROM_GENERAL)
            .where('employee.user_id = :employee_id', { employee_id: userSession.user_id })
            .getRawOne();
    }

    public async delete(employee_id: string) {
        const user = await this.findOneOrFail(employee_id);
        await this.repository.delete({ user_id: employee_id });
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

    public async getPublicEmployee(employee_id: string) {
        const query = this.repository.createQueryBuilder('employee')
            .select(['employee.user_id as user_id', 'employee.gender as gender', 'employee.status as status', 'employee.position_id as position_id'])
            .leftJoin('employee.user', 'user')
            .addSelect('user.name', 'name')
            .addSelect('user.update_at', 'update_at')
            .addSelect('user.deleted_at', 'deleted_at')
            .leftJoin('employee.position', 'position')
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
            .addSelect('enterprise.name', 'enterprise_name')
            .where('employee.user_id = :employee_id', { employee_id });
        const employee = await  query.getRawOne();
        if(!employee) throw new CustomError("Solicitud no encontrada", 404);
        return employee;
    }

    private getQuery(context: EmployeeQueryContext = EmployeeQueryContext.FROM_GENERAL) {
        const query = this.repository.createQueryBuilder('employee')
            .select(['employee.user_id as user_id', 'employee.gender as gender', 'employee.birthdate as birthdate', 'employee.curp as curp', 'employee.status as status', 'employee.rfc as rfc', 'employee.cuip as cuip', 'employee.num_children as num_children', 'employee.vacation_days as vacation_days', 'employee.boss_id as boss_id', 'employee.have_uniform as have_uniform', 'employee.num_infonavit as num_infonavit', 'employee.marital_status as marital_status', 'employee.place_registration as place_registration', 'employee.salary as salary', 'employee.cp_csf as cp_csf', 'employee.date_entry as date_entry', 'employee.position_id as position_id', 'employee.email as email', 'employee.cell_phone as cell_phone', 'employee.have_alimony as have_alimony', 'employee.cred_fonacot as cred_fonacot'])
            .leftJoin('employee.user', 'user')
            .leftJoin('employee.boss', 'boss')
            .leftJoin('boss.user', 'boss_user')
            .addSelect('user.name', 'name')
            .addSelect('user.update_at', 'update_at')
            .addSelect('user.deleted_at', 'deleted_at')
            .addSelect('boss_user.name', 'boss_name')
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


    private async findOneOrFail(employee_id: string) {
        const user = await this.getQuery(EmployeeQueryContext.FROM_POSITION)
            .where('employee.user_id = :employee_id', { employee_id })
            .getRawOne();
        if (!user) throw new CustomError("Empleado no existente", 404);
        return user;
    }
}