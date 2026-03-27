import { IsOptional, IsString } from "class-validator";

export class UpdateOfficeDto {
    @IsOptional()
    @IsString()
    name?: string;
}