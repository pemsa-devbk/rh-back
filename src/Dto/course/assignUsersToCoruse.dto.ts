import { Expose } from "class-transformer";
import { IsString } from "class-validator";


export class AssignUsersToCourseDTO {
    @Expose()
    @IsString({each: true})
    users: string[];
}