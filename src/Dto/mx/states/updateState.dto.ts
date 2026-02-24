import { IsNumberString, IsOptional, IsString, Length } from "class-validator";

export class UpdateStateDTO{

    @IsOptional()
    @IsString( {message: 'El nombre del estado es obligatorio' })
    name: string;
}