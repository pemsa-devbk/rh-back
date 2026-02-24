import { IsString, Length } from "class-validator"

export class CreateColonyDTO{
    @Length(5,5, {message: 'El codigo postal debe contener 5 digitos'})
    postal_code: string;
    
    @IsString({message: 'El nombre de la colonia es obligatorio'})
    name: string;
    
    @Length(2,2, {message: 'El tipo de asentamiento es obligatorio'})
    code_settlement: string;
}