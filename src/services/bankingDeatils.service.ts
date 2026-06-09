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
        return await this.getOne(employee_id);
        // return {...bankingDetail, ...updateDTO};

    }

    public getOne(employee_id: string){
        return this.repository.createQueryBuilder('banking')
            .select(['banking.CLABE as CLABE', 'banking.account_number as account_number', 'banking.employee_id as employee_id', 'banking.bank_id as bank_id'])
            .leftJoin('banking.bank', 'bank')
            .addSelect('bank.name', 'bank_name')
            .where('banking.employee_id = :employee_id', {employee_id}).getRawOne()
        // return this.repository.findOneBy({employee_id});
    }
}