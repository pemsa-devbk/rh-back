import { IsString, Length } from "class-validator";

export class CreateBankDTO{
    @IsString({message: 'El nombre de banco es obligatorio'})
    name: string;

    @IsString( {message: 'La clave de institución es obligatoria'})
    @Length(5, 10, {message: 'La clave de institución debe tener de 5 a 10 digitos'})
    institution_key: string;

}