import { IsEnum, IsOptional, IsString } from "class-validator";
import { ValidContact } from "../../types/enums/contact";


export class CreateContactDTO {
    @IsString({message: 'El contacto debe ser una cadena'})
    contact: string;

    @IsEnum(ValidContact, {message: 'El tipo de contacto es obligatorio'})
    type: number;

    @IsOptional()
    @IsString({message: 'Es necesario que ingrese notas'})
    notes?: string;
}