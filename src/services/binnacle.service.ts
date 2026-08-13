import { appDataSource } from "../db/dataBase";
import { Binnacle } from "../db/entities/binnacle.entity";
import { PaginationDto } from "../Dto/pagination.dto";

export class BinncacleService {
    constructor(
        private readonly binnacleRepository = appDataSource.getRepository(Binnacle)
    ) { }


    public getByUser(user_id: string, pagination: PaginationDto) {
        const { skip, take } = pagination;
        return this.binnacleRepository.createQueryBuilder('binnacle')
            .leftJoin('binnacle.modifierUser', 'modifierUser')
            .addSelect(['modifierUser.name'])
            .where('binnacle.modified_user_id = :user_id', { user_id })
            .orderBy('binnacle.created_at', 'ASC')
            .skip(skip).take(take)
            .getManyAndCount();
    }

    public async getByModified(modified_user_id: string, pagination: PaginationDto) {
        const { skip, take } = pagination;
        const query = this.getQuery();
        const [total, employees] = await Promise.all([
            this.binnacleRepository.count({
                where: {modified_user_id}
            }),
            query.andWhere('binnacle.modified_user_id = :modified_user_id', { modified_user_id }).take(take).skip(skip).getRawMany()
        ]);
        return [employees, total];
    }
    
    public async getByModifier(modifier_user_id: string, pagination: PaginationDto) {
        const { skip, take } = pagination;
        const query = this.getQuery();
        const [total, employees] = await Promise.all([
            this.binnacleRepository.count({
                where: {modifier_user_id}
            }),
            query.andWhere('binnacle.modifier_user_id = :modifier_user_id', { modifier_user_id }).take(take).skip(skip).getRawMany()
        ]);
        return [employees, total];
    }

    private getQuery() {
        return this.binnacleRepository.createQueryBuilder('binnacle')
            .select(['binnacle.binnacle_id as binnacle_id', 'binnacle.type as type', 'binnacle.comment as comment', 'binnacle.created_at as created_at', 'binnacle.modified_user_id as modified_user_id', 'binnacle.modifier_user_id as modifier_user_id'])
            .leftJoin('binnacle.modifiedUser', 'modifiedUser')
            .leftJoin('binnacle.modifierUser', 'modifierUser')
            .addSelect('modifiedUser.name', 'modified_name')
            .addSelect('modifierUser.name', 'modifier_name')
            .orderBy('binnacle.created_at', 'ASC')
    }

}