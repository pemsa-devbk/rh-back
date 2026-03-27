import { appDataSource } from "../db/dataBase";
import { EnterpriseInformation } from "../db/entities/enterprise_information.entity";
import { EnterpriseInformationDTO, UpdateEnterpriseInformationDTO } from "../Dto/user/complements/enterpriseInformation.dto";
import { CustomError } from "../utils/error";

export class EnterpriseInformationService{
    constructor(
        private readonly repository = appDataSource.getRepository(EnterpriseInformation)
    ){}

    public create(employee_id: string, createDTO: EnterpriseInformationDTO){
        return this.repository.save({
            ...createDTO,
            employee_id
        })
    }

    public async update(employee_id: string, updateDTO: UpdateEnterpriseInformationDTO ): Promise<EnterpriseInformation>{
        const enterpriseInformation = await this.getOne(employee_id);
        if(!enterpriseInformation) throw new CustomError("No existe registro de licencia, primero creé uno", 400);
        await this.repository.update({employee_id}, updateDTO);
        return {...enterpriseInformation, ...updateDTO};

    }

    public getOne(employee_id: string){
        return this.repository.findOneBy({employee_id});
    }
}