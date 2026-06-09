import { IsBoolean, IsDateString, IsEmail, IsEnum, IsIn, IsInt, IsNumber, IsNumberString, IsOptional, IsString, Length } from "class-validator";
import { MaritalStatus } from "../../types/enums/status_marital";

export class UpdateEmployeeDTO {

    @IsOptional()
    @IsString({
        message: 'El número de empleado es requerido'
    })
    @Length(5, 5, { message: 'El número de empleado debe tener 5 digitos' })
    user_id?: string;

    @IsOptional()
    @IsString({
        message: 'El nombre del empleado es obligatorio'
    })
    @Length(10, 100, { message: 'El nombre de usuario debe tener al menos 10 catacteres' })
    name?: string;

    @IsOptional()
    @IsIn(['M', 'F'])
    gender?: string;

    @IsOptional()
    @IsDateString({ strict: true }, {
        message: "La fecha de nacimiento es obligatoria",
    })
    birthdate?: Date;

    @IsOptional()
    @IsString()
    @Length(18, 18, { message: 'El CURP debe de tener 18 caracteres' })
    curp?: string;

    @IsOptional()
    @IsString()
    @Length(13, 13, { message: 'El RFC debe de tener 13 caracteres' })
    rfc?: string;

    @IsOptional()
    @IsString()
    cuip?: string;

    @IsOptional()
    @IsInt({ message: 'El campo número de hijos solo acepta valores numericos enteros' })
    num_children?: number;

    @IsOptional()
    @Length(5, 5, { message: 'El número de empleado para jefe directo debe tener 5 digitos' })
    boss_id?: string;

    @IsOptional()
    @IsBoolean()
    have_uniform?: boolean;

    @IsOptional()
    @IsNumberString()
    @Length(10, 10, { message: 'El número de credito infonavit debe tener 5 digitos' })
    num_infonavit?: string;

    @IsOptional()
    @IsEnum(MaritalStatus, { message: 'El estado civil es obligatoriao' })
    marital_status?: MaritalStatus;

    @IsOptional()
    @IsString({ message: 'El lugar de registro es obligatorio' })
    place_registration?: string;

    @IsOptional()
    @IsNumber({}, { message: 'El salario es obligatorio' })
    salary?: number;

    @IsOptional()
    @IsNumberString({}, { message: 'El codigo postal de constancia de situación fiscall debe ser numerico' })
    @Length(5, 5, { message: 'El Codigo postal de constancia de situacion fiscal debe tener 5 digitos' })
    cp_csf?: string;

    @IsOptional()
    @IsDateString({ strict: true }, {
        message: "La fecha de ingreso es obligatoria",
    })
    date_entry?: Date;

    @IsOptional()
    @IsInt({ message: 'La posición es obligatoria' })
    position_id?: number;

    @IsOptional()
    @IsEmail({}, { message: 'El correo personal es obligatorio' })
    email?: string;

    @IsOptional()
    @Length(10, 10, { message: 'El número de celular debe contener 10 caracteres' })
    cell_phone?: string;

    @IsOptional()
    @IsBoolean()
    have_alimony?: boolean;

    @IsOptional()
    @Length(20, 20, { message: 'El número de credito fonacot debe contener 20 caracteres' })
    cred_fonacot?: string;

}