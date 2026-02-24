import { IsString } from "class-validator";

export class CreateEnterpriseDTO{
    @IsString()
    name: string;
    
    @IsString()
    address: string;

}