import { IsDateString, IsOptional } from "class-validator";

export class UploadFileDTO {

    @IsOptional()
    @IsDateString({ strict: true }, {
        message: "La fecha de debe tener el formato YYYY-MM-DD",
    })
    expires_on: Date;
    
}