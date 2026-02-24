import { Expose } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class NewSignatureDto{
 
    @Expose()
    @IsString()
    name: string;

    @Expose()
    @IsString()
    @IsOptional()
    phone: string;

    @Expose()
    @IsString()
    @IsOptional()
    ext: string;

    @Expose()
    @IsString()
    @IsOptional()
    cell_phone: string;

    @Expose()
    @IsString()
    @IsOptional()
    position: string;


}