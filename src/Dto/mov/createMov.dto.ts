import { IsString } from 'class-validator'

export class CreateMovDto{
    @IsString({
        message: 'Debe ser un texto'
    })
    nameMov: string;
}