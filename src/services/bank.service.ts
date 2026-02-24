import { appDataSource } from "../db/dataBase";
import { Bank } from "../db/entities/bank.entity";
import { CreateBankDTO } from "../Dto/bank/createBank.dto";

export class BankService {
    constructor(
        private readonly repository = appDataSource.getRepository(Bank)
    ) { }

    public create(createDTO: CreateBankDTO) {
        return this.repository.save(createDTO);
    }

    public getAll() {

    }

    private getQuery() {
        return this.repository.createQueryBuilder('bank')
            .select(['bank.bank_id as bank_id', 'bank.name as name', 'bank.institution_key as institution_key'])
            .leftJoin('bank.bankingDetails', 'bankingDetails')
            .addSelect("COUNT(DISTINCT bankingDetails.bank_id)", "total_users")
            .groupBy('bank.bank_id').addGroupBy('bank.name').addGroupBy('bank.institution_key');
    }
}