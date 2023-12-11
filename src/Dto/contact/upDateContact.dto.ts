import { IsIn, IsOptional, IsString } from "class-validator";


export class UpDateContactDTO {
    @IsOptional()
    @IsString({message: 'El contacto debe ser un correo o número telefónico'})
    contact: string;

    @IsOptional()
    @IsIn([1,2], {message: 'Debe definir el tipo de contacto'})
    type: number;

    @IsOptional()
    @IsString({message: 'Es necesario que ingrese notas de descripción'})
    notes?: string;
}