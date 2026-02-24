import { Expose } from "class-transformer";
import { IsHexColor, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateSignatureDto {
    
    @Expose()
    @IsOptional()
    @IsUrl()
    url_logo: string;

    @Expose()
    @IsOptional()
    @IsString()
    color_text: string;

    @Expose()
    @IsOptional()
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
    @IsOptional()
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
    @IsOptional()
    @IsString()
    text_second_section: string;

    @Expose()
    @IsOptional()
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