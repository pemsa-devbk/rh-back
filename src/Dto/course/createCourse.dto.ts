import { IsDateString, IsOptional, IsString } from "class-validator";


export class CreateCourseDTO {
    @IsString()
    name: string;

    @IsDateString({ strict: true }, {
        message: "Fecha de inicio del curso es requerida",
    })
    date_start: Date;

    @IsDateString({ strict: true }, {
        message: "Fecha de fin del curso es requerida",
    })
    date_end: Date;

    @IsOptional()
    @IsString({each: true})
    users?: string[];
}