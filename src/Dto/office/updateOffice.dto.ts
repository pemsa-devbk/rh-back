import { Expose } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class UpdateOfficeDto {
    @IsOptional()
    @IsString()
    name?: string;

    // @IsOptional()
    // @IsString()
    // enterprise_id?: string;
}