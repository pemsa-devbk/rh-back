import { IsString, IsOptional, IsEnum} from "class-validator";
import { validRoles } from "../../types/enums/roles";
import { CreateSeedDto } from "./seedCreate.dto";



export class CreateUserDto extends CreateSeedDto{
    @IsOptional()
    @IsEnum (validRoles,{
        message:'Debe ingresar un número'
    })
    rol: string = validRoles.user;

    @IsString({
        message:'Debe ser un texto'
    })
    idChief: string;
}