import { IsDateString, IsOptional, IsString, Length } from "class-validator";

export class CreateRequestHolidaysDto {
    @IsDateString({ strict: true }, {
        message: "Debe de ingresar al menos un día de vacaciones", each: true
    })
    days: Date[];

    @IsOptional()
    @IsString()
    comment?: string;

}