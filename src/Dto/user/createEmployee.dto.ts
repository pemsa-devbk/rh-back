import { IsBoolean, IsDateString, IsEnum, IsIn, IsInt, IsNumber, IsNumberString, IsOptional, IsString, Length, ValidateNested } from "class-validator";
import { MaritalStatus } from "../../types/enums/status_marital";
import { CreateUserDto } from "./createUser.dto";
import { Type } from "class-transformer";
import { MedicalDataDTO } from "./complements/medical.dto";
import { LicenseDTO } from "./complements/license.dto";
import { EnterpriseInformationDTO } from "./complements/enterpriseInformation.dto";
import { ContractDTO } from "./complements/contract.dto";
import { BankingDetailsDTO } from "./complements/banking.dto";
import { AddressDTO } from "./complements/address.dto";

export class CreateEmployeeDTO extends CreateUserDto {
    @IsIn(['M', 'F'])
    gender: string;

    @IsDateString({ strict: true }, {
        message: "La fecha de nacimiento es obligatoria",
    })
    birthdate: Date;

    @IsString()
    @Length(18, 18, { message: 'El CURP debe de tener 18 caracteres' })
    curp: string;

    @IsString()
    @Length(13, 13, { message: 'El RFC debe de tener 13 caracteres' })
    rfc: string;

    @IsOptional()
    @IsString()
    cuip: string;

    @IsInt()
    role_id: number;

    @IsOptional()
    @IsInt({ message: 'El campo número de hijos solo acepta valores numericos enteros' })
    num_children: number;

    @IsOptional()
    @Length(5, 5, { message: 'El número de empleado para jefe directo debe tener 5 digitos' })
    user_chief_id: string;

    @IsOptional()
    @IsBoolean()
    have_uniform: boolean = false;

    @IsOptional()
    @IsNumberString()
    @Length(10, 10, { message: 'El número de credito infonavit debe tener 5 digitos' })
    num_infonavit: string;


    @IsEnum(MaritalStatus, { message: 'Es tado civil es obligatoriao' })
    marital_status: MaritalStatus;

    @IsString({ message: 'El lugar de registro es obligatorio' })
    place_registration: string;

    @IsNumber({}, { message: 'El salario es obligatorio' })
    salary: number;

    @IsNumberString()
    @Length(5, 5, { message: 'El Codigo postal de constancia de situacion fiscal debe tener 5 digitos' })
    cp_csf: string;

    @IsDateString({ strict: true }, {
        message: "La fecha de ingreso es obligatoria",
    })
    date_entry: Date;

    @IsInt({ message: 'La posición es obligatoria' })
    position_id: number;

    // * Relations
    @IsOptional()
    @ValidateNested()
    @Type( () => AddressDTO)
    address?: AddressDTO;

    @IsOptional()
    @ValidateNested()
    @Type( () => BankingDetailsDTO)
    banking?: BankingDetailsDTO;

    @IsOptional()
    @ValidateNested()
    @Type( () => ContractDTO)
    contract?: ContractDTO;

    @IsOptional()
    @ValidateNested()
    @Type( () => EnterpriseInformationDTO)
    enterpiseInformation?: EnterpriseInformationDTO;

    @IsOptional()
    @ValidateNested()
    @Type( () => LicenseDTO)
    license?: LicenseDTO;

    @IsOptional()
    @ValidateNested()
    @Type( () => MedicalDataDTO)
    medical?: MedicalDataDTO;
}