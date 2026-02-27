import { IsNumberString, IsOptional, IsString, Length } from "class-validator";

export class CreateOfficeDto {
    @IsString()
    name: string;

}