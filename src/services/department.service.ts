import { Like } from "typeorm";
import { appDataSource } from "../db/dataBase";
import { Department } from "../db/entities/department.entity";
import { CreateDepartmentDto } from "../Dto/department/createDepartment.dto";
import { PaginationDto } from "../Dto/pagination.dto";
import { CustomError } from "../utils/error";
import { UpdateDepartmentDto } from "../Dto/department/updateDepartment.dto";

enum DepartmentQueryContext {
    FROM_OFFICE = 'FROM_OFFICE',           // Desde /offices/:id/departments → Solo departamentos
    FROM_ENTERPRISE = 'FROM_ENTERPRISE',   // Desde /enterprises/:id/departments → Departamento + Office
    FROM_GENERAL = 'FROM_GENERAL'          // Desde /departments → departamento + Office + Enterprise
}

export class DepartmentService {
    constructor(
        private readonly departmentRepository = appDataSource.getRepository(Department)
    ) { }

    public create(departmentDto: CreateDepartmentDto, office_id: number) {
        return this.departmentRepository.save({
            ...departmentDto, office_id
        })
    }

    public async getAll(pagination: PaginationDto) {
        const { skip, take, search } = pagination;
        const [data, total] = await this.departmentRepository.findAndCount({
            where: search && { name: Like(`%${search}%`) },
            skip, take, select: { department_id: true }
        });
        const ids = data.map(dt => dt.department_id);
        if (ids.length == 0) return [[], total];
        const departments = await this.getQuery()
            .where('department.department_id IN (:...ids)', { ids }).getRawMany();
        return [departments, total]
    }

    public async getOne(office_id: number, department_id: number) {
        const department = await this.getQuery().where('department.office_id = :office_id', { office_id }).andWhere('department.department_id = :department_id', { department_id }).getRawOne();
        if (!department) throw new CustomError('El departamento solicitado no existe', 404);
        return department;
    }

    public async update(office_id: number, department_id: number, departmentDto: UpdateDepartmentDto): Promise<Department> {
        const department = await this.findOneOrFail(office_id, department_id);
        await this.departmentRepository.update({ department_id }, departmentDto);
        return { ...department, ...departmentDto };
    }

    public async delete(office_id: number, department_id: number) {
        const department = await this.findOneOrFail(office_id, department_id);
        await this.departmentRepository.delete({ department_id });
        return department;
    }

    public async getByOffice(office_id: number, pagination: PaginationDto) {
        const { skip, take, search } = pagination;
        const [data, total] = await this.departmentRepository.findAndCount({
            where: search ? { name: Like(`%${search}%`), office_id } : { office_id },
            skip, take, select: { department_id: true }
        });
        const ids = data.map(dt => dt.department_id);
        if (ids.length == 0) return [[], total];
        const departments = await this.getQuery(DepartmentQueryContext.FROM_OFFICE)
            .where('department.department_id IN (:...ids)', { ids }).getRawMany();
        return [departments, total]
    }

    public async getByEnterprise (enterprise_id: string, pagination: PaginationDto){
        const {skip, take, search } = pagination;
        const [data, total] = await this.departmentRepository.findAndCount({
            where: search ? {name: Like(`%${search}%`), office: {enterprise_id}} : {office: {enterprise_id}},
            skip, take, select: {department_id: true}
        });
        const ids = data.map(dt => dt.department_id);
        if(ids.length == 0) return[[], total];
        const departments = await this.getQuery(DepartmentQueryContext.FROM_ENTERPRISE)
        .where('department.department_id IN (:...ids)', { ids }).getRawMany();
        return [departments, total];
    }

    private getQuery(context: DepartmentQueryContext = DepartmentQueryContext.FROM_GENERAL) {
        const query = this.departmentRepository.createQueryBuilder('department')
            .select(["department.department_id as department_id", "department.name as name", "department.office_id as office_id", "department.responsible_user_id as responsible_user_id"])
            // Responsable
            .leftJoin('department.responsibleUser', 'responsible')
            .leftJoin('responsible.user', 'user')
            .addSelect('user.name', 'responsible_name')
            // * Conteo de relaciones
            .leftJoin('department.areas', 'area')
            .leftJoin('area.positions', 'position')
            .leftJoin("position.employees", "employee")
            .addSelect("COUNT(DISTINCT area.area_id)", "total_areas")
            .addSelect("COUNT(DISTINCT position.position_id)", "total_positions")
            .addSelect("COUNT(DISTINCT employee.user_id)", "total_employees")
            .groupBy('department.department_id').addGroupBy('department.name').addGroupBy('department.office_id').addGroupBy('department.responsible_user_id').addGroupBy('user.name')

        switch (context) {
            case DepartmentQueryContext.FROM_GENERAL:
                // Agregar office y empresa
                query.leftJoin('department.office', 'office')
                    .leftJoin('office.enterprise', 'enterprise')
                    .addSelect('office.name', 'office_name')
                    .addSelect('enterprise.name', 'enterprise_name')
                    .addSelect('enterprise.enterprise_id', 'enterprise_id')
                    .addGroupBy('office.name').addGroupBy('enterprise.name').addGroupBy('enterprise.enterprise_id')
                break;
            case DepartmentQueryContext.FROM_ENTERPRISE:
                // Agregar office
                query.leftJoin('department.office', 'office')
                    .addSelect('office.name', 'office_name')
                    .addGroupBy('office.name')
                break;
            default:
                break;
        }
        return query;
    }

    private async findOneOrFail(office_id: number, department_id: number) {
        const department = await this.departmentRepository.findOneBy({ office_id, department_id });
        if (!department) throw new CustomError('El departamento solicitado no existe', 404);
        return department;
    }
}