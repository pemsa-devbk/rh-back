import {IsString, IsOptional, Length, IsEmail, IsEnum, IsInt} from 'class-validator'
import { validRoles } from '../../types/enums/roles';

export class upDateUserDTO {
    @IsOptional()
    @IsString({
        message: 'Debe ser texto'
    })
    id?: string;

    @IsOptional()
    @IsString({
        message: 'Ingrese el nombre completo'
    })
    @Length(10, 30)
    name?:string;

    @IsOptional()
    @IsInt({
        message:'Debe ser número'
    })
    idState?: number;

    @IsOptional()
    @IsInt({
        message:'Debe ser número'
    })
    fechaNacimiento?: number;

    // @IsOptional()
    // @IsBoolean()
    // status: boolean; //Activo/Inactivo

    @IsOptional({
        message: 'Debe ingresar correo válido'
    })
    @IsEmail()
    email?:string; //Mandarlo a un nuevo Dto de Contacto

    @IsOptional()
    @IsString({
        message: 'Es necesaria la contraseña'
    })
    password?:string;//Lo envía el Admin

    @IsOptional()
    @IsEnum (validRoles, {
        message:'Debe ser un rol'
    })
    rol: string = validRoles.user;

    @IsOptional()
    @IsString({
        message: 'Debe ser texto'
    })
    idChief?: string;

}