import { IsString } from "class-validator";

//se exporta class dto ... @
export class UpDateMov{
    @IsString({
        message: 'Debe ser un texto'
    })
    name: string;
}