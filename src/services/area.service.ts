import { Like } from "typeorm";
import { appDataSource } from "../db/dataBase";
import { Area } from "../db/entities/area.entity";
import { CreateAreaDto } from "../Dto/area/createArea.dto";
import { UpdateAreaDto } from "../Dto/area/updateArea.dto";
import { CustomError } from "../utils/error";
import { PaginationDto } from "../Dto/pagination.dto";

enum AreaQueryContext {
    FROM_DEPARTMENT = 'FROM_DEPARTMENT',   // Desde /departments/:id/areas → Solo área
    FROM_OFFICE = 'FROM_OFFICE',           // Desde /offices/:id/areas → Department + Área 
    FROM_ENTERPRISE = 'FROM_ENTERPRISE',   // Desde /enterprises/:id/areas → Office + Department + Área 
    FROM_GENERAL = 'FROM_GENERAL'          // Desde /areas → Enterprise + Office + Department + Área
}
export class AreaService {

    constructor(
        private areaRepository = appDataSource.getRepository(Area)
    ) { }

    public create(areaDto: CreateAreaDto, department_id: number) {
        return this.areaRepository.save({
            ...areaDto, department_id
        });
    }

    public async getAll(pagination: PaginationDto) {
        const { take, skip, search } = pagination;

        const [data, total] = await this.areaRepository.findAndCount({
            where: search ? { name: Like(`%${search}%`) } : undefined,
            skip, take, select: { area_id: true }
        });
        const ids = data.map(dt => dt.area_id);
        if (ids.length == 0) return [[], total];
        const areas = await this.getQuery()
            .where('area.area_id IN (:...ids)', { ids })
            .getRawMany();
        return [areas, total];
    }

    public async getOne(department_id: number, area_id: number) {
        const area = await this.getQuery().where('area.area_id = :area_id', { area_id }).andWhere('area.department_id = :department_id', { department_id }).getRawOne();
        if (!area) throw new CustomError('El area solicititada no existe', 404);
        return area;
    }

    public async update(department_id: number, area_id: number, partialArea: UpdateAreaDto) {
        const area = await this.findOneOrFail(department_id, area_id);
        await this.areaRepository.update({ area_id }, partialArea);
        return { ...area, ...partialArea };
    }

    public async delete(department_id: number, area_id: number) {
        const area = await this.findOneOrFail(department_id, area_id);
        await this.areaRepository.delete({ area_id });
        return area;
    }

    public async getByDepartment(department_id: number, pagination: PaginationDto) {
        const { take, skip, search } = pagination;
        const [data, total] = await this.areaRepository.findAndCount({
            where: search ? { name: Like(`%${search}%`), department_id } : { department_id },
            skip, take, select: { area_id: true }
        });
        const ids = data.map(dt => dt.area_id);
        if (ids.length == 0) return [[], total];
        const areas = await this.getQuery(AreaQueryContext.FROM_DEPARTMENT)
            .where('area.area_id IN (:...ids)', { ids })
            .getRawMany()
        return [areas, total];
    }

    public async getByOffice(office_id: number, pagination: PaginationDto) {
        const { take, skip, search } = pagination;
        const [data, total] = await this.areaRepository.findAndCount({
            where: search ? { name: Like(`%${search}%`), deparment: { office_id } } : { deparment: { office_id } },
            skip, take, select: { area_id: true }
        });
        const ids = data.map(dt => dt.area_id);
        if (ids.length == 0) return [[], total];
        const areas = await this.getQuery(AreaQueryContext.FROM_OFFICE)
            .where('area.area_id IN (:...ids)', { ids })
            .getRawMany()
        return [areas, total];
    }

    public async getByEnterprice(enterprise_id: string, pagination: PaginationDto) {
        const { take, skip, search } = pagination;
        const [data, total] = await this.areaRepository.findAndCount({
            where: search ? { name: Like(`%${search}%`), deparment: { office: { enterprise_id } } } : { deparment: { office: { enterprise_id } } },
            skip, take, select: { area_id: true }
        });
        const ids = data.map(dt => dt.area_id);
        if (ids.length == 0) return [[], total];
        const areas = await this.getQuery(AreaQueryContext.FROM_ENTERPRISE)
            .where('area.area_id IN (:...ids)', { ids })
            .getRawMany();
        return [areas, total];
    }

    private getQuery(context: AreaQueryContext = AreaQueryContext.FROM_GENERAL) {
        const query = this.areaRepository.createQueryBuilder("area")
            .select(["area.area_id as area_id", "area.name as name", "area.responsible_user_id as responsible_user_id", "area.department_id as department_id"])
            // Incluir responsable de area
            .leftJoin('area.responsibleUser', 'responsibleUser')
            .addSelect('responsibleUser.name', 'responsible_name')
            // Conteo de relaciones
            .leftJoin("area.positions", "position")
            .leftJoin("position.users", "user")
            .addSelect("COUNT(DISTINCT position.position_id)", "total_positions")
            .addSelect("COUNT(DISTINCT user.user_id)", "total_users")
            //  Agrupación
            .groupBy('area.area_id').addGroupBy('area.name').addGroupBy('area.responsible_user_id').addGroupBy('area.department_id').addGroupBy('responsibleUser.name')

        switch (context) {
            case AreaQueryContext.FROM_GENERAL:
                // Agregar enterprise + office + department
                query
                    .leftJoin('area.deparment', 'deparment')
                    .leftJoin('deparment.office', 'office')
                    .leftJoin('office.enterprise', 'enterprise')
                    .addSelect('deparment.name', 'deparment_name')
                    .addSelect('office.office_id', 'office_id')
                    .addSelect('office.name', 'office_name')
                    .addSelect('enterprise.enterprise_id', 'enterprise_id')
                    .addSelect('enterprise.name', 'enterprise_name')
                    .addGroupBy('deparment.name')
                    .addGroupBy('office.office_id')
                    .addGroupBy('office.name')
                    .addGroupBy('enterprise.enterprise_id')
                    .addGroupBy('enterprise.name');
                break;
            case AreaQueryContext.FROM_ENTERPRISE:
                // Agregar office + department
                query
                    .leftJoin('area.deparment', 'deparment')
                    .leftJoin('deparment.office', 'office')
                    .addSelect('deparment.name', 'deparment_name')
                    .addSelect('office.office_id', 'office_id')
                    .addSelect('office.name', 'office_name')
                    .addGroupBy('deparment.name')
                    .addGroupBy('office.office_id')
                    .addGroupBy('office.name')
                break;
            case AreaQueryContext.FROM_OFFICE:
                // Agregar office
                query
                    .leftJoin('area.deparment', 'deparment')
                    .addSelect('deparment.name', 'deparment_name')
                    .addGroupBy('deparment.name')
                break;
            default:
                // Ya conozco office y enterprise, no agregar nada adicional
                break;

        }
        return query;
    }

    private async findOneOrFail(department_id: number, area_id: number) {
        const area = await this.areaRepository.findOne({
            where: { area_id, department_id }
        });
        if (!area) throw new CustomError('El area solicititada no existe', 404);
        return area;
    }
}