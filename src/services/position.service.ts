import { Like } from "typeorm";
import { appDataSource } from "../db/dataBase";
import { Position } from "../db/entities/position.entity";
import { CreatePositionDto } from "../Dto/position/createPosition.dto";
import { UpdatePositionDto } from "../Dto/position/updatePosition.dto";
import { QueryRelationsDTO } from "../Dto/query_relations.dto";
import { CustomError } from "../utils/error";

enum PositionQueryContext {
    FROM_AREA = 'FROM_AREA',               // Desde /areas/:id/positions → Solo Position
    FROM_DEPARTMENT = 'FROM_DEPARTMENT',   // Desde /departments/:id/positions → Área + Position
    FROM_OFFICE = 'FROM_OFFICE',           // Desde /offices/:id/positions → Solo Department + Área + Position
    FROM_ENTERPRISE = 'FROM_ENTERPRISE',   // Desde /enterprises/:id/positions → Office + Department + Área + Position
    FROM_GENERAL = 'FROM_GENERAL'          // Desde /positions → Enterprise + Office + Department + Área + Position
}
export class PositionService {
    constructor(
        private positionrepository = appDataSource.getRepository(Position)
    ) { }
    public create(area_id: number, positionDto: CreatePositionDto): Promise<Position> {
        return this.positionrepository.save({ ...positionDto, area_id });
    }

    public async getOne(area_id: number, position_id: number) {
        const position = await this.getQuery(PositionQueryContext.FROM_GENERAL).where('position.area_id = :area_id', { area_id }).andWhere('position.position_id = :position_id', { position_id }).getRawOne();
        if (!position) throw new CustomError("El puesto no existe", 404);
        return position;
    }

    public async getAll(pagination: QueryRelationsDTO) {
        const { take, skip, search } = pagination;
        const [data, total] = await this.positionrepository.findAndCount({
            where: search ? { name: Like(`%${search}%`) } : undefined,
            take, skip, select: { position_id: true }
        });
        const ids = data.map(dt => dt.position_id);
        if (ids.length === 0) return [[], total];

        const positions = await this.getQuery(PositionQueryContext.FROM_GENERAL)
            .where('position.position_id IN (:...ids)', { ids })
            .getRawMany();
        return [positions, total]
    }

    public async getByArea(area_id: number, pagination: QueryRelationsDTO) {
        const { take, skip, search } = pagination;
        const [data, total] = await this.positionrepository.findAndCount({
            where: search ? { name: Like(`%${search}%`), area_id } : { area_id },
            take, skip, select: { position_id: true }
        });
        const ids = data.map(dt => dt.position_id);
        if (ids.length === 0) return [[], total];

        const positions = await this.getQuery(PositionQueryContext.FROM_AREA)
            .where('position.position_id IN (:...ids)', { ids })
            .getRawMany();
        return [positions, total]
    }

    public async getByDepartment(department_id: number, pagination: QueryRelationsDTO) {
        const { take, skip, search } = pagination;
        const [data, total] = await this.positionrepository.findAndCount({
            where: search ? { name: Like(`%${search}%`), area: {department_id} } : { area: {department_id} },
            take, skip, select: { position_id: true }
        });
        const ids = data.map(dt => dt.position_id);
        if (ids.length === 0) return [[], total];

        const positions = await this.getQuery(PositionQueryContext.FROM_AREA)
            .where('position.position_id IN (:...ids)', { ids })
            .getRawMany();
        return [positions, total]
    }

    public async getByOffice(office_id: number, pagination: QueryRelationsDTO) {
        const { take, skip, search } = pagination;
        const [data, total] = await this.positionrepository.findAndCount({
            where: search ? { name: Like(`%${search}%`), area: { deparment: {office_id} } } : { area: { deparment: {office_id} } },
            take, skip, select: { position_id: true }
        });
        const ids = data.map(dt => dt.position_id);
        if (ids.length === 0) return [[], total];

        const positions = await this.getQuery(PositionQueryContext.FROM_OFFICE)
            .where('position.position_id IN (:...ids)', { ids })
            .getRawMany();
        return [positions, total]
    }

    public async getByEnterprise(enterprise_id: string, pagination: QueryRelationsDTO) {
        const { take, skip, search } = pagination;
        const [data, total] = await this.positionrepository.findAndCount({
            where: search ? { name: Like(`%${search}%`), area: { deparment: {office: { enterprise_id}} } } : { area: { deparment: {office: { enterprise_id}} } },
            take, skip, select: { position_id: true }
        });
        const ids = data.map(dt => dt.position_id);
        if (ids.length === 0) return [[], total];

        const positions = await this.getQuery(PositionQueryContext.FROM_ENTERPRISE)
            .where('position.position_id IN (:...ids)', { ids })
            .getRawMany()
        return [positions, total]
    }

    public async update(area_id: number, position_id: number, partialPosition: UpdatePositionDto): Promise<Position> {
        const position = await this.findOneOrFail(area_id, position_id);
        await this.positionrepository.update({ position_id }, partialPosition);
        return { ...position, ...partialPosition };
    }

    public async delete(area_id: number, position_id: number) {
        const position = await this.findOneOrFail(area_id, position_id);
        await this.positionrepository.delete({ position_id });
        return position;
    }

    private getQuery(context: PositionQueryContext = PositionQueryContext.FROM_GENERAL) {
        const query = this.positionrepository.createQueryBuilder("position")
            .select(["position.position_id as position_id", "position.name as name", "position.area_id as area_id"])
            // conteo de relaciones
            .leftJoin('position.users', 'user')
            .addSelect("COUNT(DISTINCT user.user_id)", "total_users")
            .groupBy('position.position_id').addGroupBy('position.name').addGroupBy('position.area_id')

        switch (context) {
            case PositionQueryContext.FROM_GENERAL:
                // Agregar Enterprise + Office + Department + Área + Position
                query
                    .leftJoin('position.area', 'area')
                    .leftJoin('area.deparment', 'deparment')
                    .leftJoin('deparment.office', 'office')
                    .leftJoin('office.enterprise', 'enterprise')
                    .addSelect('area.name', 'area_name')
                    .addSelect('deparment.name', 'deparment_name')
                    .addSelect('deparment.deparment_id', 'deparment_id')
                    .addSelect('office.name', 'office_name')
                    .addSelect('office.office_id', 'office_id')
                    .addSelect('enterprise.name', 'enterprise_name')
                    .addSelect('enterprise.enterprise_id', 'enterprise_id')
                    .addGroupBy('area.name').addGroupBy('deparment.name').addGroupBy('deparment.deparment_id').addGroupBy('office.name').addGroupBy('office.office_id').addGroupBy('enterprise.name').addGroupBy('enterprise.enterprise_id')
                break;
            case PositionQueryContext.FROM_ENTERPRISE:
                // Agregar Office + Department + Área + Position
                query
                    .leftJoin('position.area', 'area')
                    .leftJoin('area.deparment', 'deparment')
                    .leftJoin('deparment.office', 'office')
                    .addSelect('area.name', 'area_name')
                    .addSelect('deparment.name', 'deparment_name')
                    .addSelect('deparment.deparment_id', 'deparment_id')
                    .addSelect('office.name', 'office_name')
                    .addSelect('office.office_id', 'office_id')
                    .addGroupBy('area.name').addGroupBy('deparment.name').addGroupBy('deparment.deparment_id').addGroupBy('office.name').addGroupBy('office.office_id')
                break;
            case PositionQueryContext.FROM_OFFICE:
                // Agregar Department + Área + Position
                query
                    .leftJoin('position.area', 'area')
                    .leftJoin('area.deparment', 'deparment')
                    .addSelect('area.name', 'area_name')
                    .addSelect('deparment.name', 'deparment_name')
                    .addSelect('deparment.deparment_id', 'deparment_id')
                    .addGroupBy('area.name').addGroupBy('deparment.name').addGroupBy('deparment.deparment_id')
                break;
            case PositionQueryContext.FROM_DEPARTMENT:
                // Agregar Área + Position
                query
                    .leftJoin('position.area', 'area')
                    .addSelect('area.name', 'area_name')
                    .addGroupBy('area.name')
                break;
            default: // Ya conozco el area, office y enterprise, no se agrega nada adicional
                break;

        }
        // if (ids) query.
        return query;
    }

    private async findOneOrFail(area_id: number, position_id: number) {
        const position = await this.positionrepository.findOne({
            where: { position_id, area_id }
        });
        if (!position) throw new CustomError("El puesto no existe", 404) ;
        return position;
    }
}