import { IsOptional, IsString } from "class-validator";

export class UpdateMunicipalityDTO{

    @IsOptional()
    @IsString( {message: 'El nombre del estado es obligatorio' })
    name: string;
}