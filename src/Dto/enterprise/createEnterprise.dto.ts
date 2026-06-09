import { IsString, ValidateNested } from "class-validator";
import { CreateSignatureDto } from "./createSignature.dto";
import { Type } from "class-transformer";

export class CreateEnterpriseDTO{
    @IsString()
    name: string;
    
    @IsString()
    address: string;

    @ValidateNested()
    @Type( () => CreateSignatureDto)
    signature: CreateSignatureDto;

}