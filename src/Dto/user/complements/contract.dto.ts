import { IsDateString, IsEnum, ValidateIf } from "class-validator";
import { ContractType } from "../../../types/enums/contract";

export class ContractDTO {
    @IsEnum(ContractType, {message: 'Solo se aceptan los valores Temporal e indeterminado'})
    type: string;

    @ValidateIf(o => o.type == ContractType.TEMPORARY)
    @IsDateString({ strict: true }, {
        message: "La vigencia del contrato es obligatoria",
    })
    validity: string;
}