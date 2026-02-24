import { IsDateString, IsOptional, IsString } from "class-validator";


export class UpdateCourseDTO {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsDateString({ strict: true }, {
        message: "Fecha de nacimiento",
    })
    date_start: Date;

    @IsOptional()
    @IsDateString({ strict: true }, {
        message: "Fecha de nacimiento",
    })
    date_end: Date;

}