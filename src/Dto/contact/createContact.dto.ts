import { IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { ValidContact } from "../../types/enums/contact";
import { Type } from "class-transformer";


export class CreateContactDTO {
    @ValidateNested({ each: true, message: 'Se requiere al menos un contacto' }) //valida un obj dentro de otro de obj
    @Type(() => ContactDto)
    contacts: ContactDto[];
}

export class ContactDto {
    @IsString({ message: 'El contacto debe ser una cadena' })
    contact: string;

    @IsEnum(ValidContact, { message: 'El tipo de contacto es obligatorio' })
    type: number;

    @IsOptional()
    @IsString({ message: 'Es necesario que ingrese notas' })
    notes?: string;
}