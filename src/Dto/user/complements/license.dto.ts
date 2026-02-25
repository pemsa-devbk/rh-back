import { IsDateString, IsEnum } from "class-validator";
import { LicenseType } from "../../../types/enums/license";

export class LicenseDTO {
    @IsDateString({ strict: true }, {
        message: "La fecha de emisión es obligatoria",
    })
    issue_date: string;

    @IsEnum(LicenseType, {message: 'Solo se aceptan los valores mercantirl y particular'})
    type: LicenseType;

    @IsDateString({ strict: true }, {
        message: "La fecha de vigencia es obligatoria",
    })
    validity: string;
}