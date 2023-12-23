import { IsString, IsOptional, Length, IsEmail, IsEnum, IsInt } from 'class-validator'
import { validRoles } from '../../types/enums/roles';

export class upDateUserDTO {

    @IsOptional()
    @IsString({
        message: 'Ingrese el nombre completo'
    })
    @Length(10, 100)
    name?: string;

    @IsOptional()
    @IsString({
        message:'Indique el puesto de este usuario'
    })
    position:string;

    @IsOptional()
    @Length(10,15)
    phone:string;

    @IsOptional()
    @IsString({
        message:'Ingrese fecha de nacimiento por número y separados por - '
    })
    birthdate:Date;

    @Length(18,18)
    curp:string;

    @IsOptional()
    @IsString({
        message:'Ingrese la dirección del usuario '
    })
    address:string;

    @IsOptional()
    @Length(2,3)
    bloodType:string;

    @IsOptional()
    @IsString({
        message:'Ingrese que tipo de alergias padece este usuario'
    })
    allergies:string;

    @IsOptional()
    @Length(11,11)
    nss:string;
    
    @IsOptional()
    @IsString()
    cuip:string;

    @IsOptional()
    @IsInt({
        message: 'El ID del estado debe ser un número'
    })
    idState?: number;

    // @IsOptional()
    // @IsBoolean()
    // status: boolean; //Activo/Inactivo

    @IsOptional({
        message: 'Debe ingresar un correo válido'
    })
    @IsEmail()
    email?: string; //Mandarlo a un nuevo Dto de Contacto

    @IsOptional()
    @IsString({
        message: 'Es necesaria la contraseña'
    })
    password?: string;//Lo envía el Admin

    @IsOptional()
    @IsEnum(validRoles, {
        message: 'Debe ser un rol'
    })
    rol: string = validRoles.user;

    @IsOptional()
    @IsString({
        message: 'Debe ser texto'
    })
    idChief?: string;

}