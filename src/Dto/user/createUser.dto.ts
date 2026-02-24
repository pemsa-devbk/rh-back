import { IsString, IsOptional, IsEnum, IsInt, Length, IsEmail, IsIn, IsDateString, IsBoolean, IsNumberString, IsNumber, ValidateIf } from "class-validator";
import { validRoles } from "../../types/enums/roles";
import { BloodType } from "../../types/enums/blood";
import { MaritalStatus } from "../../types/enums/status_marital";


export class AddressDto {
    @IsString({ message: 'La dirección es obligatoria' })
    street: string;

    @IsOptional()
    @IsString()
    references: string;
}

export class EnterpriseInformationDto {
    @IsEmail({}, { message: 'El formato de correo electronico no es correcto' })
    email: string;

    @IsOptional()
    @Length(10, 10, { message: 'El número de telefono debe contener 10 caracteres' })
    phone: string;

    @IsOptional()
    @ValidateIf(o => !!o.phone)
    @IsNumberString()
    @Length(1, 6, { message: 'La extención de telefono debe contener de 1 a 6 caracteres' })
    ext: string;

    @IsOptional()
    @Length(10, 10, { message: 'El número de celular debe contener 10 caracteres' })
    cell_phone: string;
}

export class MedicalDataDto {
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

export class LicenseDto {
    @IsDateString({ strict: true }, {
        message: "La fecha de emisión es obligatoria",
    })
    issue_date: string;

    // TODO
    type: any;

    @IsDateString({ strict: true }, {
        message: "La fecha de vigencia es obligatoria",
    })
    validity: string;
}

export class BankingDetailsDto {
    @IsInt({message: 'El banco es obligatorio'})
    bank_id: number;

    @IsNumberString()
    @Length(18, 18, { message: 'La CLABE interbancaria es obligatoria y debe contener 18 caracteres' })
    CLABE: string;

    @IsNumberString()
    @Length(13, 24, { message: 'El numero de cuenta debe tener de 13 a 24 digitos' })
    account_number: string;

}

export class ContractDto {
    // TODO validar validity en caso de que el contrato sea temporal
    type: string;

    @IsDateString({ strict: true }, {
        message: "La vigencia del contrato es obligatoria",
    })
    validity: string;
}


export class CreateUserDto {
    @IsString({
        message: 'El número de empleado es requerido'
    })
    @Length(5, 5, { message: 'El número de empleado debe tener 5 digitos' })
    user_id: string;

    @IsString({
        message: 'El nombre del empleado es obligatorio'
    })
    @Length(10, 100, { message: 'El nombre de usuario debe tener al menos 10 catacteres' })
    name: string; //nombre oficial del empleado

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

    @IsOptional()
    @IsEnum(validRoles, {
        message: 'Rol no valido'
    })
    rol: string = validRoles.USER;

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

    
    @IsEnum(MaritalStatus, {message: 'Es tado civil es obligatoriao'})
    marital_status: 
    MaritalStatus;

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

}



// export class CreateUserDto extends CreateSeedDto {




//     @Expose()
//     @IsOptional({})
//     @IsEnum(BloodType)
//     blood_type: string;

//     @Expose()
//     @IsOptional()
//     @IsString()
//     allergies: string;

//     @Expose()
//     @IsOptional()
//     @Length(11, 11)
//     nss: string;

//     @Expose()
//     @IsOptional()
//     @IsString()
//     cuip: string;

//     @Expose()
//     @IsOptional()
//     @IsEnum(validRoles, {
//         message: 'Rol no valido'
//     })
//     rol: string = validRoles.USER;

//     // TODO : validar
//     @Expose()
//     @IsOptional()
//     @IsInt()
//     vacation_days: number;

//     @Expose()
//     @IsOptional()
//     @IsString({
//         message: 'El campo jefe directo es obligatorio'
//     })
//     user_chief_id: string;

//     @Expose()
//     


// }
