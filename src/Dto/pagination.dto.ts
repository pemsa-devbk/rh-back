import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class OrderDTO {

    @IsOptional()
    @IsString()
    orderBy?: string;

    @IsOptional()
    @IsString()
    orderDirection: "ASC" | "DESC" = "ASC";

}

export class PaginationDto extends OrderDTO {
    // * Eliminar
    search: string; 
    @IsOptional()
    @Min(1)
    @IsInt({ message: "La cantidad de datos a obtener debe ser entero" })
    take: number = 10;

    @IsOptional()
    @Min(0)
    @IsInt({ message: "La cantidad de datos a saltar debe ser entero" })
    skip: number = 0;

}