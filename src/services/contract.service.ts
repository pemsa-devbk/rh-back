import { appDataSource } from "../db/dataBase";
import { Contract } from "../db/entities/contract.entity";
import { ContractDTO } from "../Dto/user/complements/contract.dto";
import { ContractType } from "../types/enums/contract";
import { CustomError } from "../utils/error";

export class ContractService{
    constructor(
        private readonly repository = appDataSource.getRepository(Contract)
    ){}

    public create(employee_id: string, createDTO: ContractDTO){
        let partialContract: Partial<ContractDTO> = {type: createDTO.type}; 
        if(createDTO.type == ContractType.TEMPORARY) partialContract.validity = createDTO.validity;
        return this.repository.save({
            ...partialContract,
            employee_id
        })
    }

    public async delete(employee_id: string, contract_id: number ): Promise<Contract>{
        const contract = await this.getOne(employee_id, contract_id);
        if(!contract) throw new CustomError("Contrato no encontrado", 404);
        await this.repository.delete({employee_id, contract_id});
        return contract;

    }

    public getAll(employee_id: string){
        return this.repository.findBy({employee_id});
    }

    public getOne(employee_id: string, contract_id: number){
        return this.repository.findOneBy({employee_id, contract_id});
    }
}