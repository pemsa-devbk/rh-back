import { IsNumberString, IsString, Length } from "class-validator";

export class CreateStateDTO{
    @IsNumberString()
    @Length(2,2, {message: 'El codigo de estado debe contener 2 caracteres'})
    code_state: string;

    @IsString( {message: 'El nombre del estado es obligatorio' })
    name: string;
}