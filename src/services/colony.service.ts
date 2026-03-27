import { appDataSource } from '../db/dataBase';
import { Colony } from '../db/entities/colony.entity';
import { CreateColonyDTO } from '../Dto/mx/colony/createColony.dto';
import { PaginationDto } from '../Dto/pagination.dto';
import { UpdateColonyDTO } from '../Dto/mx/colony/updateColony.dto';
import { Like } from 'typeorm';
import { CustomError } from '../utils/error';

enum ColonyQueryContext {
    FROM_MUNICIPALITY = 'FROM_MUNICIPALITY',           // Desde /municipalities/:id/colonies → Solo colony
    FROM_STATE = 'FROM_STATE',   // Desde /states/:id/colonies → municipality + colony
    FROM_GENERAL = 'FROM_GENERAL'          // Desde /colonies → state + municipality + colony
}

export class ColonyService {
    constructor(
        private readonly repository = appDataSource.getRepository(Colony)
    ) { }

    public create(municipality_id: string, createDTO: CreateColonyDTO): Promise<Colony> {
        return this.repository.save({
            ...createDTO, municipality_id
        });
    }

    public async getAll(pagination: PaginationDto) {
        const { skip, take, search } = pagination;
        const [data, total] = await this.repository.findAndCount({
            where: search && { name: Like(`%${search}%`) },
            skip, take, select: { colony_id: true }
        });
        const ids = data.map(dt => dt.colony_id);
        if (ids.length === 0) return [[], total];
        const colonies = await this.getQuery()
            .where('colony.colony_id IN (:...ids)', { ids }).getRawMany()
        return [colonies, total];
    }

    public async getByState(code_state: string, pagination: PaginationDto) {
        const { skip, take, search } = pagination;
        const [data, total] = await this.repository.findAndCount({
            where: search ? { name: Like(`%${search}%`), municipality: {code_state} } : { municipality: {code_state} },
            skip, take, select: { colony_id: true }
        });
        const ids = data.map(dt => dt.colony_id);
        if (ids.length === 0) return [[], total];
        const colonies = await this.getQuery(ColonyQueryContext.FROM_STATE)
            .where('colony.colony_id IN (:...ids)', { ids }).getRawMany()
        return [colonies, total];
    }

    public async getByMunicipality(municipality_id: string, pagination: PaginationDto) {
        const { skip, take, search } = pagination;
        const [data, total] = await this.repository.findAndCount({
            where: search ? { name: Like(`%${search}%`), municipality_id } : { municipality_id },
            skip, take, select: { colony_id: true }
        });
        const ids = data.map(dt => dt.colony_id);
        if (ids.length === 0) return [[], total];
        const colonies = await this.getQuery(ColonyQueryContext.FROM_MUNICIPALITY)
            .where('colony.colony_id IN (:...ids)', { ids }).getRawMany()
        return [colonies, total];
    }

    public async getOne(municipality_id: string, colony_id: number) {
        const colony = await this.getQuery().where('colony.municipality_id = :municipality_id', { municipality_id }).andWhere('colony.colony_id = :colony_id', { colony_id }).getRawOne();
        if (!colony) throw new CustomError('La colonia solicitada no existe', 404);
        return colony;
    }

    public async getByPostalCode(postal_code: string){
        const colonies = await this.repository.find({
            where: {postal_code}, relations: { municipality: {state: true}, settlement: true}
        });
        if(colonies.length === 0) throw new CustomError('Codigo postal no registrado', 404);
        return {
            state_name: colonies[0].municipality.state.name,
            code_state: colonies[0].municipality.state.code_state,
            municipality_name: colonies[0].municipality.name,
            municipality_id: colonies[0].municipality_id,
            colonies: colonies.map( colony => ({
                name: colony.name,
                colony_id: colony.colony_id,
                settlement_name: colony.settlement.name
            }))
        }
    }

    public async update(municipality_id: string, colony_id: number, updateDTO: UpdateColonyDTO): Promise<Colony> {
        const colony = await this.findOneOrFail(municipality_id, colony_id);
        await this.repository.update({ colony_id }, updateDTO);
        return { ...colony, ...updateDTO };
    }

    public async delete(municipality_id: string, colony_id: number) {
        const colony = await this.findOneOrFail(municipality_id, colony_id);
        await this.repository.delete({ colony_id });
        return colony;
    }

    private async findOneOrFail(municipality_id: string, colony_id: number) {
        const colony = await this.repository.findOne({
            where: { colony_id, municipality_id }
        });
        if (!colony) throw new CustomError("La colonia no existente", 404);
        return colony;
    }

    private getQuery(contex: ColonyQueryContext = ColonyQueryContext.FROM_GENERAL) {
        const query = this.repository.createQueryBuilder('colony')
            .select(['colony.colony_id as colony_id', 'colony.postal_code as postal_code', 'colony.name as name', 'colony.code_settlement as code_settlement', 'colony.municipality_id as municipality_id',])
            .leftJoin('colony.addresses', 'address')
            .leftJoin('colony.settlement', 'settlement')
            .addSelect('settlement.name', 'settlement_name')
            .addSelect('COUNT(DISTINCT address.user_id)', 'total_addresses')
            .groupBy('colony.colony_id').addGroupBy('colony.postal_code').addGroupBy('colony.name').addGroupBy('colony.code_settlement').addGroupBy('colony.municipality_id').addGroupBy('settlement.name');
        switch(contex){
            case ColonyQueryContext.FROM_GENERAL:
                // Agregar state, municipality
                query.leftJoin('colony.municipality', 'municipality')
                query.leftJoin('municipality.state', 'state')
                .addSelect('municipality.name', 'municipality_name')
                .addSelect('state.code_state', 'code_state')
                .addSelect('state.name', 'state_name')
                .addGroupBy('municipality.name').addGroupBy('state.code_state').addGroupBy('state.name');
                break;
            case ColonyQueryContext.FROM_STATE:
                // Agregar municipality
                query.leftJoin('colony.municipality', 'municipality')
                .addSelect('municipality.name', 'municipality_name')
                .addGroupBy('municipality.name')
                break;
            default: 
            break;
        }
        return query;
    }

    // public loadInformation() {
    //     const settments: Array<Settlement> = [];
    //     const states: Array<State> = [];
    //     const municipalities: Array<Municipality> = [];
    //     const colonies: Array<Colony> = [];
    //     const dir = join(__dirname, '..', '..', 'public', 'data.csv')
    //     fs.createReadStream(dir)
    //         .pipe(csv({ separator: '|' }))
    //         .on('data', (data) => {
    //             // * Tipos de asetamiento
    //             // if (!settments.find(sett => sett.code_settlement == data['c_tipo_asenta']))
    //             //     settments.push({
    //             //         code_settlement: data['c_tipo_asenta'],
    //             //         name: data['d_tipo_asenta']
    //             //     });

    //             // * Estados
    //             // if (!states.find(sett => sett.code_state == data['c_estado']))
    //             //     states.push({
    //             //         code_state: data['c_estado'],
    //             //         name: data['d_estado']
    //             //     });
    //             // * Municipios
    //             // if (!municipalities.find(sett => sett.municipality_id == `${data['c_estado']}_${data['c_mnpio']}`))
    //             //     municipalities.push(this.repository.create({
    //             //         municipality_id: `${data['c_estado']}_${data['c_mnpio']}`.trim(),
    //             //         code_state: data['c_estado'].trim(),
    //             //         name: data['D_mnpio'].trim(),
    //             //         code_municipality: data['c_mnpio'].trim()
    //             //     }));
    //             // * colonias
    //             colonies.push(this.repository.create({
    //                 postal_code: data['d_codigo'].trim(),
    //                 name: data['d_asenta'].trim(),
    //                 id_asenta_cpcons: data['id_asenta_cpcons'].trim(),
    //                 municipality_id: `${data['c_estado']}_${data['c_mnpio']}`.trim(),
    //                 code_settlement: data['c_tipo_asenta'].trim()
    //             }));
    //             // results.push(data);
    //         })
    //         .on('end', async () => {
    //             await this.repository.save(colonies, { chunk: 400 });
    //         })
    // }
}