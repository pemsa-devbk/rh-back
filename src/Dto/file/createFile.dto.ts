import { Transform } from "class-transformer";
import { IsBoolean, IsMimeType, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateFileDTO{
    @IsString({message: 'El nombre debe ser de tipo texto'})
    @Length(3, 20, {message: 'El nombre debe contener entre 4 y 20 caracteres'})
    name: string;
    
    @Length(5,10, {message: 'La key del archivo debe tener de 5 a 10 caracteres y debe ser unico'})
    key: string;
    
    @IsMimeType({each: true, message: 'Solo se aceptan tipos validos (consulte mime types)'})
    valid_mime_types: string[];

    @IsNumber()
    max_size: number;

    @IsOptional()
    @IsBoolean()
    is_required: boolean = true;

    @IsOptional()
    @IsString({message: 'La descripcion debe ser de tipo texto'})
    description: string;

    @IsBoolean()
    @IsOptional()
    is_active: boolean = true;
}