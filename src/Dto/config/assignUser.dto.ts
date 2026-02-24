import { IsEnum, IsString, Length, MaxLength } from "class-validator";
import { SystemConfig } from "../../types/enums/system_config";

export class AssignUserDto {
    @IsString({
        message: 'El número de empleado es requerido'
    })
    @Length(5, 5, {})
    user_id: string; //Num de empleado

    @IsEnum(SystemConfig)
    key: SystemConfig;
}