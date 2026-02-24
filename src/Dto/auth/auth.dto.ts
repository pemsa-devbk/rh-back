import { IsString, Length } from "class-validator";


export class AuthDTO {
    @IsString({
        message:'Debe ser texto'
    })
    @Length(5,5,{message:'numero de empleado no valido'})
    user_id: string; //Num de empleado

    @IsString({
        message:'La contraseña es obligatoria'
    })
 
    password: string;
}