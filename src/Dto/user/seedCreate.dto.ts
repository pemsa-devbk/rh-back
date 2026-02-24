import { Expose } from "class-transformer";
import { IsString, Length, IsDateString, IsIn } from "class-validator";

export class CreateSeedDto {
    @Expose()
    @IsString({
        message: 'El número de empleado es requerido'
    })
    @Length(5, 5, {})
    user_id: string; //Num de empleado

    @Expose()
    @IsString({
        message: 'El nombre del empleado es obligatorio'
    })
    @Length(10, 100)
    name: string; //nombre oficial del empleado

    @Expose()
    @IsIn(['M', 'F'])
    gender: string;

    @Expose()
    @IsDateString({ strict: true }, {
        message: "Fecha de nacimiento",
    })
    birthdate: Date;

    @Expose()
    @Length(18, 18)
    curp: string;

    // @IsString({
    //     message: 'Debe ser texto'
    // })
    // password: string; //lo envia el admin

    @Expose()
    @IsDateString({ strict: true }, {
        message: "Fecha de contrato",
    })
    contract_date: Date;

}