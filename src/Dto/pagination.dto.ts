import { IsDateString, IsInt, IsOptional, IsString, Min, ValidateIf } from "class-validator";

export class SearchDTO {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    searchKey?: string;

    @IsOptional()
    @IsString()
    orderBy?: string;

    @IsOptional()
    @IsString()
    orderDirection: "ASC" | "DESC" = "ASC";

    @IsOptional()
    @IsDateString({}, { message: "dateFrom debe tener formato YYYY-MM-DD" })
    dateFrom?: string;

    // Solo se valida si dateFrom fue enviado
    @ValidateIf((o) => !!o.dateFrom)
    @IsOptional()
    @IsDateString({}, { message: "dateTo debe tener formato YYYY-MM-DD" })
    dateTo?: string;
}

export class PaginationDto extends SearchDTO {

    @IsOptional()
    @Min(1)
    @IsInt({ message: "La cantidad de datos a obtener debe ser entero" })
    take: number = 10;

    @IsOptional()
    @Min(0)
    @IsInt({ message: "La cantidad de datos a saltar debe ser entero" })
    skip: number = 0;

}