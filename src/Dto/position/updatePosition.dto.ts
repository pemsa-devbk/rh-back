import { IsInt, IsOptional, IsString } from "class-validator";

export class UpdatePositionDto {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsInt()
    area_id?: number;
}