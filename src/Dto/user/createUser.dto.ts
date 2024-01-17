import { IsString, IsOptional, IsEnum} from "class-validator";
import { validRoles } from "../../types/enums/roles";
import { CreateSeedDto } from "./seedCreate.dto";


export class CreateUserDto extends CreateSeedDto{
    @IsOptional()
    @IsEnum (validRoles,{
        message:'Rol no valido'
    })
    rol: string = validRoles.USER;

    @IsString({
        message:'El campo jefe directo es obligatorio'
    })
    idChief: string;
}
