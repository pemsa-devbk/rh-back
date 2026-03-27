import { IsInt, IsOptional, IsString, Length} from "class-validator";

export class CreateUserDto {
    @IsString({
        message: 'El número de empleado es requerido'
    })
    @Length(5, 5, { message: 'El número de empleado debe tener 5 digitos' })
    user_id: string;

    @IsString({
        message: 'El nombre del empleado es obligatorio'
    })
    @Length(10, 100, { message: 'El nombre de usuario debe tener al menos 10 catacteres' })
    name: string; 

    @IsOptional()
    @IsInt({message: 'El identificador de rol es obligatorio'})
    role_id: number = 2;

    @IsOptional()
    @IsString()
    password: string;



}
