import { appDataSource } from "../db/dataBase";
import { Address } from "../db/entities/address.entity";
import { AddressDTO, UpdateAddressDTO } from "../Dto/user/complements/address.dto";
import { CustomError } from "../utils/error";

export class AddressService{
    constructor(
        private readonly repository = appDataSource.getRepository(Address)
    ){}

    public create(user_id: string, createDTO: AddressDTO){
        return this.repository.save({
            user_id,
            ...createDTO, 
        })
    }

    public async update(user_id: string, updateDTO: UpdateAddressDTO): Promise<Address>{
        const address = await this.getOne(user_id);
        if(!address) throw new CustomError('No existe registro medico, primero creé uno', 400);
        await this.repository.update({user_id}, updateDTO);
        return {...address, ...updateDTO}
    }

    public getOne(user_id: string){
        return this.repository.findOneBy({user_id});
    }
}