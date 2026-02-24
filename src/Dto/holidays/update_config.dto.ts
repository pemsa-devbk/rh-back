import { IsInt, IsOptional } from "class-validator";

export class UpdateConfigDto{
    @IsOptional()
    @IsInt()
    min_year: number;

    @IsOptional()
    @IsInt()
    max_year: number;

    @IsOptional()
    @IsInt()
    number_days: number;
}