import { IsString, IsOptional, IsEnum} from "class-validator";
import { validRoles } from "../../types/enums/roles";
import { CreateSeedDto } from "./seedCreate.dto";


export class CreateUserDto extends CreateSeedDto{
    @IsOptional()
    @IsEnum (validRoles,{
        message:'Debe ingresar un rol'
    })
    rol: string = validRoles.user;

    @IsString({
        message:'Debe ingresar el id de jefe directo'
    })
    idChief: string;
}
