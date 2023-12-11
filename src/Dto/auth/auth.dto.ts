import { IsString, Length } from "class-validator";


export class AuthDTO {
    @IsString({
        message:'Debe ser texto'
    })
    @Length(6,8,{message:'lolololololl'})
    id: string; //Num de empleado

    @IsString({
        message:'Debe ser entre 8 y 10 carateres '
    })
    @Length(8,10,{})
    password: string;
}