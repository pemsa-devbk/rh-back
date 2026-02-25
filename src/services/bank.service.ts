import { Like } from "typeorm";
import { appDataSource } from "../db/dataBase";
import { Bank } from "../db/entities/bank.entity";
import { CreateBankDTO } from "../Dto/bank/createBank.dto";
import { PaginationDto } from "../Dto/pagination.dto";
import { CustomError } from "../utils/error";
import { UpdateBankDTO } from "../Dto/bank/updateBank.dto";

export class BankService {
    constructor(
        private readonly repository = appDataSource.getRepository(Bank)
    ) { }

    public create(createDTO: CreateBankDTO) {
        return this.repository.save(createDTO);
    }

    public async getAll(pagination: PaginationDto) {
        const { skip, take, search } = pagination;
        const [data, total] = await this.repository.findAndCount({
            where: search && { name: Like(`%${search}%`) },
            skip, take, select: { institution_key: true }
        });
        const ids = data.map(dt => dt.institution_key);
        if (ids.length == 0) return [[], total];
        const banks = await this.getQuery()
            .where('bank.institution_key IN (:...ids)', { ids }).getRawMany();
        return [banks, total];
    }

    public async getOne(bank_id: number) {
        const bank = await this.getQuery()
            .where('bank.bank_id = :bank_id', { bank_id }).getRawOne();
        if(!bank) throw new CustomError("EL banco solicitado no existe", 404);
        return bank;
    }

    public async update(bank_id: number, updateDTO: UpdateBankDTO): Promise<Bank>{
        const bank = await this.findOneOrFail(bank_id);
        await this.repository.update({bank_id}, updateDTO);
        return {...bank, ...updateDTO};
    }

    public async delete(bank_id: number){
        const bank = await this.findOneOrFail(bank_id);
        await this.repository.delete({bank_id});
        return bank;
    }

    private getQuery() {
        return this.repository.createQueryBuilder('bank')
            .select(['bank.bank_id as bank_id', 'bank.name as name', 'bank.institution_key as institution_key'])
            .leftJoin('bank.bankingDetails', 'bankingDetails')
            .addSelect("COUNT(DISTINCT bankingDetails.bank_id)", "total_users")
            .groupBy('bank.bank_id').addGroupBy('bank.name').addGroupBy('bank.institution_key');
    }
    private async findOneOrFail(bank_id: number){
        const bank = await this.repository.findOneBy({bank_id});
        if(!bank) throw new CustomError("El banco solicitado no existe", 404);
        return bank;
    }

    // public loadInformation(){
    //     const banks: Array<Bank> = [];
    //     const dir = join(__dirname, '..', '..', 'public', 'data_bank.csv')

    //     fs.createReadStream(dir)
    //     .pipe(csv())
    //     .on('data', (data) => {
    //         banks.push(data);
    //     })
    //     .on('end', async() => {
    //         this.repository.save(banks);

    //     })
    // }
}