import { appDataSource } from "../db/dataBase";
import { License } from "../db/entities/license.entity";
import { LicenseDTO, UpdateLicenseDto } from "../Dto/user/complements/license.dto";
import { CustomError } from "../utils/error";

export class LicenseService{
    constructor(
        private readonly repository = appDataSource.getRepository(License)
    ){}

    public create(employee_id: string, createDTO: LicenseDTO){
        return this.repository.save({
            ...createDTO,
            employee_id
        })
    }

    public async update(employee_id: string, updateDTO: UpdateLicenseDto ): Promise<License>{
        const license = await this.getOne(employee_id);
        if(!license) throw new CustomError("No existe registro de licencia, primero creé uno", 400);
        await this.repository.update({employee_id}, updateDTO);
        return {...license, ...updateDTO};

    }

    public getOne(employee_id: string){
        return this.repository.findOneBy({employee_id});
    }
}