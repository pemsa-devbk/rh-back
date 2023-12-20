import { IsString, Length, IsInt, IsDefined, ValidateNested, IsOptional} from "class-validator";
import { CreateContactDTO } from "../contact/createContact.dto";
import { Type } from "class-transformer";


export class CreateSeedDto{
    @IsString({
        message:'Debe ingresar el ID para el usuario'
    })
    @Length(5,5,{})
    id: string; //Num de empleado

    @IsString({
        message:'Ingrese el nombre completo del usuario'
    })
    @Length(10,100)
    name: string; //nombre oficial del empleado

    @IsString({
        message: "Debe indicar el puesto de este usuario"
    })
    position:string;

    @IsOptional()
    @Length(10,15)
    phone:string;

    @IsOptional()
    @IsString({
        message: ""
    })
    birthdate:Date;

    @Length(18,18)
    curp:string;

    @IsOptional()
    @IsString()
    address:string;

    @IsOptional()
    @Length(2,3)
    bloodType:string;

    @IsOptional()
    @IsString()
    allergies:string;

    @IsOptional()
    @Length(11,11)
    nss:string;

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