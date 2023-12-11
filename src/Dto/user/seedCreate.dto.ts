import { IsString, Length, IsInt, IsDefined, ValidateNested} from "class-validator";
import { CreateContactDTO } from "../contact/createContact.dto";
import { Type } from "class-transformer";


export class CreateSeedDto{
    @IsString({
        message:'Debe ser texto'
    })
    @Length(6,8,{})
    id: string; //Num de empleado

    @IsString({
        message:'Ingrese el nombre completo'
    })
    @Length(10,30)
    name: string; //nombre oficial del empleado

    @IsInt({
        message: "Ingrese la edad"
    })
    fechaNacimiento: number;

    @IsInt({
        message: "Es obligatorio"
    })
    idState: number; //usar selector para mejor manejo de entrada de datos

    @IsString({
        message: 'Debe ser texto'
    })
    password: string; //lo envia el admin

    //relaciones
    @IsDefined()
    @ValidateNested({each: true}) //valida un obj dentro de otro de obj
    @Type( () => CreateContactDTO )
    contacts: CreateContactDTO[];
}