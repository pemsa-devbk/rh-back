import { Expose } from "class-transformer";
import { IsHexColor, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateSignatureDto {
    @Expose()
    @IsUrl()
    url_logo: string;

    @Expose()
    @IsString()
    color_text: string;

    @Expose()
    @IsUrl({}, { message: 'Debe ser una URL válida' })
    background: string;

    @Expose()
    @IsOptional()
    @IsString()
    extra_text?: string;

    @Expose()
    @IsOptional()
    @IsHexColor()
    color_extra?: string;

    @Expose()
    @IsString()
    text_first_section: string;

    @Expose()
    @IsOptional()
    @IsHexColor()
    first_color_first_section?: string;

    @Expose()
    @IsOptional()
    @IsHexColor()
    second_color_first_section?: string;

    @Expose()
    @IsString()
    text_second_section: string;

    @Expose()
    @IsString()
    text_third_section: string;

    @Expose()
    @IsOptional()
    @IsHexColor()
    first_color_third_section?: string;

    @Expose()
    @IsOptional()
    @IsHexColor()
    second_color_third_section?: string;

    @Expose()
    @IsOptional()
    @IsString()
    vertical_text?: string;
    
    @Expose()
    @IsOptional()
    @IsHexColor()
    color_vertical_text?: string;
}