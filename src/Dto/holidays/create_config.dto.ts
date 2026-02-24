import { IsInt } from "class-validator";

export class CreateConfigDto{
    @IsInt()
    min_year: number;

    @IsInt()
    max_year: number;

    @IsInt()
    number_days: number;
}