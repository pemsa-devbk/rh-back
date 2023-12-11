import { IsIn, IsOptional, IsString } from "class-validator";


export class CreateContactDTO {
    @IsString({message: 'El contacto debe ser una cadena'})
    contact: string;

    @IsIn([1,2], {message: 'Debe definir el tipo de contacto'})
    type: number;

    @IsOptional()
    @IsString({message: 'Es necesario que ingrese notas'})
    notes?: string;
}