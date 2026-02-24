import { IsNumberString, IsString, Length } from "class-validator";

export class CreateMunicipalityDTO{
    @IsNumberString()
    @Length(3,3, {message: 'El codigo de estado debe contener 3 caracteres'})
    code_municipality: string;

    @IsString( {message: 'El nombre del estado es obligatorio' })
    name: string;
}