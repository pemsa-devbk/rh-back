import { IsOptional, IsString } from "class-validator";

export class UpdateEnterpriseDTO{
    @IsOptional()
    @IsString()
    name: string;
    
    @IsOptional()
    @IsString()
    address: string;
}