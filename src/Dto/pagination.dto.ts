import { IsInt, IsOptional, IsString } from "class-validator";


export class PaginationDto{

    @IsOptional()
    @IsInt({ message: "La cantidad de datos a obtener debe ser entero"})
    take: number = 10;

    @IsOptional()
    @IsInt({ message: "La cantidad de datos a saltar debe ser entero"})
    skip: number = 0;

    @IsOptional()
    @IsString()
    search?: string;
}