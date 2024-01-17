import { IsString, Length, IsInt, IsDefined, ValidateNested, IsOptional, IsEnum, IsDateString, IsIn} from "class-validator";
import { CreateContactDTO } from "../contact/createContact.dto";
import { Type } from "class-transformer";
import { BloodType } from "../../types/enums/blood";


export class CreateSeedDto{
    @IsString({
        message:'El número de empleado es requerido'
    })
    @Length(5,5,{})
    id: string; //Num de empleado

    @IsString({
        message:'El nombre del empleado es obligatorio'
    })
    @Length(10,100)
    name: string; //nombre oficial del empleado

    @IsString({
        message: "El puesto del empleado es obligatorio"
    })
    position:string;

    @IsIn(['M', 'F'])
    gender: string;

    @IsOptional()
    @Length(10,10, {message: 'El numero de télefono debe tener entre 10 digitos'})
    phone:string;

    @IsOptional()
    @IsDateString({strict: true},{
        message: "Algo aqui paso",

    })
    birthdate:Date;

    @Length(18,18)
    curp:string;

    @IsOptional()
    @IsString()
    address:string;

    @IsOptional({})
    @IsEnum(BloodType)
    bloodType:string;

    @IsOptional()
    @IsString()
    allergies:string;

    @IsOptional()
    @Length(11,11)
    nss:string;

    @IsOptional()
    @IsString()
    cuip:string;

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