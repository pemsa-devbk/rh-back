import { Like } from "typeorm";
import { appDataSource } from "../db/dataBase";
import { PaginationDto } from "../Dto/pagination.dto";
import { CustomError } from "../utils/error";
import { Municipality } from "../db/entities/municipaly.entity";
import { CreateMunicipalityDTO } from "../Dto/mx/municipality/createMunicipality.dto";
import { UpdateMunicipalityDTO } from "../Dto/mx/municipality/updateMunicipality.dto";

export class MunicipalityService {
    constructor(
        private readonly repository = appDataSource.getRepository(Municipality)
    ){}

    public create(code_state: string, createDTO: CreateMunicipalityDTO):Promise<Municipality>{
        const {code_municipality, name} = createDTO;
        return this.repository.save({
            municipality_id: `${code_state}_${code_municipality}`,
            name,
            code_municipality,
            code_state
        });
    }

    public async getAll(pagination: PaginationDto){
        const {skip, take, search} = pagination;
        const [data, total] = await this.repository.findAndCount({
            where: search && { name: Like(`%${search}%`)},
            skip, take, select: {municipality_id: true}
        });
        const ids = data.map(dt => dt.municipality_id);
        if(ids.length === 0) return[[], total];
        const municipalities = await this.getQuery()
            .where('municipality.municipality_id IN (:...ids)', {ids}).getRawMany()
        return [municipalities, total];
    }

    public async getByState(code_state: string ,pagination: PaginationDto){
        const {skip, take, search} = pagination;
        const [data, total] = await this.repository.findAndCount({
            where: search ? { name: Like(`%${search}%`), code_state} : {code_state},
            skip, take, select: {municipality_id: true}
        });
        const ids = data.map(dt => dt.municipality_id);
        if(ids.length === 0) return[[], total];
        const municipalities = await this.getQuery()
            .where('municipality.municipality_id IN (:...ids)', {ids}).getRawMany()
        return [municipalities, total];
    }

    public async getOne(code_state: string, municipality_id: string){
        const municipality = await this.getQuery().where('municipality.municipality_id = :municipality_id', {municipality_id}).andWhere('municipality.code_state = :code_state', {code_state}).getRawOne();
        if(!municipality) throw new CustomError('El municipio solicitado no existe', 404);
        return municipality;
    }

    public async update(code_state: string, municipality_id: string, updateDTO: UpdateMunicipalityDTO): Promise<Municipality>{
        const municipality = await this.findOneOrFail(code_state, municipality_id);
        await this.repository.update({municipality_id}, updateDTO);
        return {...municipality, ...updateDTO};
    }

    public async delete(code_state: string, municipality_id: string){
        const municipality = await this.findOneOrFail(code_state, municipality_id);
        await this.repository.delete({municipality_id});
        return municipality;
    }

    private async findOneOrFail(code_state: string, municipality_id: string){
        const municipality = await this.repository.findOne({
            where: {code_state, municipality_id}
        });
        if(!municipality) throw new CustomError("El municipio no existente", 404);
        return municipality;
    }

    private getQuery(){
        return this.repository.createQueryBuilder('municipality')
        .select(['municipality.municipality_id as municipality_id', 'municipality.name as name', 'municipality.code_municipality as code_municipality', 'municipality.code_state as code_state'])
        .leftJoin('municipality.colonies', 'colony')
        .leftJoin('colony.addresses', 'address')
        .addSelect('COUNT(DISTINCT colony.colony_id)', 'total_colonies')
        .addSelect('COUNT(DISTINCT address.address_id)', 'total_addresses')
        .groupBy('municipality.municipality_id').addGroupBy('municipality.name').addGroupBy('municipality.code_municipality').addGroupBy('municipality.code_state')
    }
}