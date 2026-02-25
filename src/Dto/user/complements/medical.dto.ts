import { IsEnum, IsOptional, IsString, Length } from "class-validator";
import { BloodType } from "../../../types/enums/blood";

export class MedicalDataDTO {
    @IsOptional({})
    @IsEnum(BloodType)
    blood_type: string;

    @IsOptional()
    @IsString({})
    allergies: string;

    @IsOptional()
    @Length(11, 11, { message: 'El número de seguro social debe contener 11 caracteres' })
    nss: string;

    @IsOptional()
    @IsString()
    diseases: string;
}