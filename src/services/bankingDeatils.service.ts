import { appDataSource } from "../db/dataBase";
import { BankingDetails } from "../db/entities/banking_details.entity";
import { BankingDetailsDTO, UpdateBankingDetailsDTO } from "../Dto/user/complements/banking.dto";
import { CustomError } from "../utils/error";

export class BankingDetailsService{
    constructor(
        private readonly repository = appDataSource.getRepository(BankingDetails)
    ){}

    public create(employee_id: string, createDTO: BankingDetailsDTO){
        return this.repository.save({
            ...createDTO,
            employee_id
        })
    }

    public async update(employee_id: string, updateDTO: UpdateBankingDetailsDTO ): Promise<BankingDetails>{
        const bankingDetail = await this.getOne(employee_id);
        if(!bankingDetail) throw new CustomError("No existe registro bancario, primero creé uno", 400);
        await this.repository.update({employee_id}, updateDTO);
        return {...bankingDetail, ...updateDTO};

    }

    public getOne(employee_id: string){
        return this.repository.findOneBy({employee_id});
    }
}