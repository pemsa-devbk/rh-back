import { IsInt, IsOptional, IsString, Length } from "class-validator";

export class UpdateDepartmentDto{
    @IsString()
    name: string;

    @IsOptional()
    @IsInt()
    office_id: number;

    @IsOptional()
    @IsString({message: 'El usuario responsable debe ser de tipo string'})
    @Length(5, 5, {message: 'El codigo de usuario responsable debe tener 5 digitos'})
    responsible_user_id?: string;
}