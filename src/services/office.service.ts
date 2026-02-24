import { Like } from "typeorm";
import { appDataSource } from "../db/dataBase";
import { Office } from "../db/entities/office.entity";
import { CreateOfficeDto } from "../Dto/office/createOffice.dto";
import { UpdateOfficeDto } from "../Dto/office/updateOffice.dto";
import { QueryRelationsDTO } from "../Dto/query_relations.dto";

enum OfficeQueryContext {
    FROM_ENTERPRISE = 'FROM_ENTERPRISE',   // Desde /enterprises/:id/offices
    FROM_GENERAL = 'FROM_GENERAL'
}
export class OfficeService {
    constructor(
        private readonly officeRepository = appDataSource.getRepository(Office)
    ) { }

    public create(officeDto: CreateOfficeDto, enterprise_id: string) {
        const officeToCreate = this.officeRepository.create({
            ...officeDto, enterprise_id
        });
        return this.officeRepository.save(officeToCreate);
    }

    public async getOne(enterprise_id: string, office_id: number) {
        const office = await this.getQuery(OfficeQueryContext.FROM_GENERAL).where("office.office_id = :office_id", {office_id}).andWhere("office.enterprise_id = :enterprise_id", {enterprise_id}).getRawOne();
        ({ where: { office_id, enterprise_id } });
        if (!office) throw 'Oficiona no encontrada';
        return office;
    }

    public async getAll(pagination: QueryRelationsDTO) {
        const { skip, take, search } = pagination;
        const [data, total] = await this.officeRepository.findAndCount({
            where: search ? { name: Like(`%${search}%`) } : undefined,
            skip, take
        });
        const ids = data.map(dt => dt.office_id);
        if (ids.length === 0) return [[], total];

        const offices = await this.getQuery(OfficeQueryContext.FROM_GENERAL)
            .where("office.office_id IN (:...ids)", { ids })
            .getRawMany();

        return [offices, total];
    }

    public async update(enterprise_id: string, office_id: number, partialOffice: UpdateOfficeDto) {
        const office = this.findOneOrFail(enterprise_id, office_id);
        await this.officeRepository.update({ office_id }, partialOffice);
        return { ...office, ...partialOffice };
    }

    public async delete(enterprise_id: string, office_id: number) {
        const office = this.findOneOrFail(enterprise_id, office_id);
        await this.officeRepository.delete({ office_id });
        return office;
    }

    public async getByEnterprise(enterprise_id: string, pagination: QueryRelationsDTO): Promise<[any[], number]> {
        const { skip, take, search } = pagination;
        const [data, total] = await this.officeRepository.findAndCount({
            where: search ? { name: Like(`%${search}%`), enterprise_id } : { enterprise_id },
            skip, take
        });
        const ids = data.map(dt => dt.office_id);
        if (ids.length === 0) return [[], total];
        const offices = await this.getQuery(OfficeQueryContext.FROM_ENTERPRISE)
            .where("office.office_id IN (:...ids)", { ids })
            .getRawMany();
        return [offices, total];
    }

    private getQuery(context: OfficeQueryContext = OfficeQueryContext.FROM_ENTERPRISE) {
        const query = this.officeRepository.createQueryBuilder("office")
            .select(["office.office_id as office_id", "office.name as name", "office.enterprise_id as enterprise_id", "office.responsible_user_id as responsible_user_id"])
            .leftJoin("office.departments", "department")
            .leftJoin("department.areas", "area")
            .leftJoin("area.positions", "position")
            .leftJoin("position.users", "user")
            .addSelect("COUNT(DISTINCT department.department_id)", "total_departments")
            .addSelect("COUNT(DISTINCT area.area_id)", "total_areas")
            .addSelect("COUNT(DISTINCT position.position_id)", "total_positions")
            .addSelect("COUNT(DISTINCT user.user_id)", "total_users")
            .groupBy("office.office_id").addGroupBy("office.name").addGroupBy('office.enterprise_id')

        switch (context) {
            case OfficeQueryContext.FROM_GENERAL:
                // Necesito enterprise
                query
                    .leftJoin("office.enterprise", "enterprise")
                    .addSelect("enterprise.name", "enterprise_name")
                    .addGroupBy('enterprise.name')
                break;
            default:
                // Ya conozco enterprise, no agrego nada adicional
                break;
        }

        return query;
    }

    private async findOneOrFail(enterprise_id: string, office_id: number) {
        const office = await this.officeRepository.findOne({ where: { office_id, enterprise_id } });
        if (!office) throw 'Oficiona no encontrada';
        return office;
    }
}