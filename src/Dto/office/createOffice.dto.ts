import { IsOptional, IsString } from "class-validator";

export class CreateOfficeDto {
    @IsString()
    name: string;
}