import { IsInt, IsNumberString, Length } from "class-validator";

export class BankingDetailsDTO {
    @IsInt({message: 'El banco es obligatorio'})
    bank_id: number;

    @IsNumberString()
    @Length(18, 18, { message: 'La CLABE interbancaria es obligatoria y debe contener 18 caracteres' })
    CLABE: string;

    @IsNumberString()
    @Length(13, 24, { message: 'El numero de cuenta debe tener de 13 a 24 digitos' })
    account_number: string;

}