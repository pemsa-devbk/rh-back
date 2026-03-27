import { appDataSource } from "../db/dataBase";
import { Address } from "../db/entities/address.entity";
import { AddressDTO, UpdateAddressDTO } from "../Dto/user/complements/address.dto";
import { CustomError } from "../utils/error";

export class AddressService{
    constructor(
        private readonly repository = appDataSource.getRepository(Address)
    ){}

    public create(employee_id: string, createDTO: AddressDTO){
        return this.repository.save({
            employee_id,
            ...createDTO, 
        })
    }

    public async update(employee_id: string, updateDTO: UpdateAddressDTO): Promise<Address>{
        const address = await this.getOne(employee_id);
        if(!address) throw new CustomError('No existe registro de dirección, primero creé uno', 400);
        await this.repository.update({employee_id}, updateDTO);
        return {...address, ...updateDTO}
    }

    public async getOne(employee_id: string){
        const addres = await this.repository.createQueryBuilder('address')
            .select(['address.street as street', 'address.references as "references"', 'address.employee_id as employee_id', 'address.colony_id as colony_id'])
            .leftJoin('address.colony', 'colony')
            .leftJoin('colony.settlement', 'settlement')
            .leftJoin('colony.municipality', 'municipality')
            .leftJoin('municipality.state', 'state')
            .addSelect('colony.name', 'colony_name')
            .addSelect('colony.postal_code', 'postal_code')
            .addSelect('settlement.name', 'settlement_name')
            .addSelect('municipality.name', 'municipality_name')
            .addSelect('state.name', 'state_name')
            .where('address.employee_id = :employee_id', {employee_id})
            .getRawOne();

            
        if(!addres) throw new CustomError('No hay información de domicilio', 404);
        return addres;
    }
}