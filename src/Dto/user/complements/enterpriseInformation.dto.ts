import { IsEmail, IsNumberString, IsOptional, Length, ValidateIf } from "class-validator";

export class EnterpriseInformationDTO {
    @IsOptional()
    @IsEmail({}, { message: 'El formato de correo electronico no es correcto' })
    email: string;

    // @IsOptional()
    @ValidateIf(o => !!o.ext, {message: 'Si incluye el campo extensión debe proporcionar un número de telefono'})
    @Length(10, 10, { message: 'El número de telefono debe contener 10 caracteres' })
    phone: string;

    // @IsOptional()
    @ValidateIf(o => !!o.phone, { message: 'Si incluye un telefono debe incluir la extensión'})
    @IsNumberString()
    @Length(1, 6, { message: 'La extención de telefono debe contener de 1 a 6 caracteres' })
    ext: string;

    @IsOptional()
    @Length(10, 10, { message: 'El número de celular debe contener 10 caracteres' })
    cell_phone: string;
}