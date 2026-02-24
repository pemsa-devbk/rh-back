import { appDataSource } from "../db/dataBase";
import { Binnacle } from "../db/entities/binnacle.entity";
import { PaginationDto } from "../Dto/pagination.dto";

export class BinncacleService {
    constructor(
        private readonly binnacleRepository = appDataSource.getRepository(Binnacle)
    ){}

    public getByUser (user_id: string, pagination: PaginationDto){
        const {skip, take} = pagination;
        return this.binnacleRepository.createQueryBuilder('binnacle')
            .leftJoin('binnacle.modifierUser', 'modifierUser')
            .addSelect(['modifierUser.name'])
            .where('binnacle.modified_user_id = :user_id', {user_id})
            .skip(skip).take(take)
            .getManyAndCount();
    }
    
}