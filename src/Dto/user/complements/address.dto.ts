import { IsInt, IsOptional, IsString } from "class-validator";

export class AddressDTO {

    @IsInt({message: 'La colonia es obligatoria'})
    colony_id: number;

    @IsString({ message: 'La dirección es obligatoria' })
    street: string;

    @IsOptional()
    @IsString()
    references: string;
}