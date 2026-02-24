import { Like } from "typeorm";
import { appDataSource } from "../db/dataBase";
import { State } from "../db/entities/state.entity";
import { CreateStateDTO } from "../Dto/mx/states/createState.dto";
import { PaginationDto } from "../Dto/pagination.dto";
import { CustomError } from "../utils/error";
import { UpdateStateDTO } from "../Dto/mx/states/updateState.dto";

export class StateService {
    constructor(
        private readonly repository = appDataSource.getRepository(State)
    ){}

    public create(createDTO: CreateStateDTO){
        return this.repository.save(createDTO);
    }

    public async getAll(pagination: PaginationDto){
        const {skip, take, search} = pagination;
        const [data, total] = await this.repository.findAndCount({
            where: search && { name: Like(`%${search}%`)},
            skip, take, select: {code_state: true}
        });
        const ids = data.map(dt => dt.code_state);
        if(ids.length === 0) return[[], total];
        const states = await this.getQuery()
            .where('state.code_state IN (:...ids)', {ids}).getRawMany()
        return [states, total];
    }

    public async getOne(code_state: string){
        const state = await this.getQuery().where('state.code_state = :code_state', {code_state}).getRawOne();
        if(!state) throw new CustomError('El estado solicitado no existe', 404);
        return state;
    }

    public async update(code_state: string, updateDTO: UpdateStateDTO): Promise<State>{
        const state = await this.findOneOrFail(code_state);
        await this.repository.update({code_state}, updateDTO);
        return {...state, ...updateDTO};
    }

    public async delete(code_state: string){
        const state = await this.findOneOrFail(code_state);
        await this.repository.delete({code_state});
        return state;
    }

    private async findOneOrFail(code_state: string){
        const state = await this.repository.findOne({
            where: {code_state}
        });
        if(!state) throw new CustomError("Estado no existente", 404);
        return state;
    }

    private getQuery(){
        return this.repository.createQueryBuilder('state')
        .select(["state.code_state as code_state", "state.name as name"])
        .leftJoin('state.municipalities', 'municipality')
        .leftJoin('municipality.colonies', 'colony')
        .leftJoin('colony.addresses', 'address')
        .addSelect('COUNT(DISTINCT municipality.municipality_id)', 'total_municipalities')
        .addSelect('COUNT(DISTINCT colony.colony_id)', 'total_colonies')
        .addSelect('COUNT(DISTINCT address.address_id)', 'total_addresses')
        .groupBy('state.code_state').addGroupBy('state.name')
    }
}