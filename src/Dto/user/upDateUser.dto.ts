import { IsString, IsOptional, Length, IsEmail, IsEnum, IsInt, IsDateString, IsIn } from 'class-validator'
import { validRoles } from '../../types/enums/roles';
import { Expose } from 'class-transformer';

export class upDateUserDTO {
    // @Expose()
    // @IsOptional()
    // @IsString({
    //     message: 'Ingrese el nombre completo'
    // })
    // @Length(10, 100)
    // name?: string;

    // @Expose()
    // @IsOptional()
    // @Length(10, 15)
    // phone?: string;

    // @Expose()
    // @IsOptional()
    // @IsIn(['M', 'F'])
    // gender: string;

    // @Expose()
    // @IsOptional()
    // @IsDateString({ strict: true }, {
    //     message: 'Ingrese fecha de nacimiento por número y separados por - '
    // })
    // birthdate?: Date;

    // @Expose()
    // @IsOptional()
    // @Length(18, 18)
    // curp?: string;

    // @Expose()
    // @IsOptional()
    // @IsString({
    //     message: 'Ingrese la dirección del usuario '
    // })
    // address?: string;

    // @Expose()
    // @IsOptional()
    // @Length(2, 3)
    // blood_type?: string;

    // @Expose()
    // @IsOptional()
    // @IsString({
    //     message: 'Ingrese que tipo de alergias padece este usuario'
    // })
    // allergies?: string;

    // @Expose()
    // @IsOptional()
    // @Length(11, 11)
    // nss?: string;

    // @Expose()
    // @IsOptional()
    // @IsString()
    // cuip?: string;

    // @Expose()
    // @IsOptional({
    //     message: 'Debe ingresar un correo válido'
    // })
    // @IsEmail()
    // email?: string; //Mandarlo a un nuevo Dto de Contacto

    // @Expose()
    // @IsOptional()
    // @IsEnum(validRoles, {
    //     message: 'Debe ser un rol'
    // })
    // rol: string = validRoles.USER;

    // @Expose()
    // @IsOptional()
    // @IsString({
    //     message: 'Debe ser texto'
    // })
    // user_chief_id?: string;

}