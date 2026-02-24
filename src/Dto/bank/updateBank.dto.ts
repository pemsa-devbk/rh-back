import { IsOptional, IsString, Length } from "class-validator";

export class UpdateBankDTO{
    @IsOptional()
    @IsString({message: 'El nombre de banco es obligatorio'})
    name: string;

    @IsOptional()
    @Length(5, 10, {message: 'La clave de institución debe tener de 5 a 10 digitos'})
    institution_key: string;
    
}