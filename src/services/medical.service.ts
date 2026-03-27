import { appDataSource } from "../db/dataBase";
import { MedicalData } from "../db/entities/medical_data.entity";
import { MedicalDataDTO, UpdateMedicalDataDTO } from "../Dto/user/complements/medical.dto";
import { CustomError } from "../utils/error";

export class MedicalService{
    constructor(
        private readonly repository = appDataSource.getRepository(MedicalData)
    ){}

    public create(employee_id: string, createDTO: MedicalDataDTO){
        return this.repository.save({
            ...createDTO,
            employee_id
        })
    }

    public async update(employee_id: string, updateDTO: UpdateMedicalDataDTO): Promise<MedicalData>{
        const medical = await this.getOne(employee_id);
        if(!medical) throw new CustomError("No existe registro medico, primero creé uno", 400);
        await this.repository.update({employee_id}, updateDTO);
        return {...medical, ...updateDTO};

    }

    public getOne(employee_id: string){
        return this.repository.findOneBy({employee_id});
    }
}