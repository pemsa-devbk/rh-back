import { IsString, Length, IsInt, IsDefined, ValidateNested, IsDate} from "class-validator";
import { CreateContactDTO } from "../contact/createContact.dto";
import { Type } from "class-transformer";


export class CreateSeedDto{
    @IsString({
        message:'Debe ingresar el ID para el usuario'
    })
    @Length(6,8,{})
    id: string; //Num de empleado

    @IsString({
        message:'Ingrese el nombre completo del usuario'
    })
    @Length(10,30)
    name: string; //nombre oficial del empleado

    @IsString({
        message: "Ingrese la fecha de nacimiento",
         
    })
    fnacimiento: Date;

    @IsInt({
        message: "Registre el ID de estado para la oficina"
    })
    idState: number; //usar selector para mejor manejo de entrada de datos

    @IsString({
        message: 'Debe ser texto'
    })
    password: string; //lo envia el admin

    //relaciones
    @IsDefined()
    @ValidateNested({each: true, message: 'apartado contacto'}) //valida un obj dentro de otro de obj
    @Type( () => CreateContactDTO )
    contacts: CreateContactDTO[];
}