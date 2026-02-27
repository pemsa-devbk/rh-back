import { Expose } from "class-transformer";
import { IsInt, IsOptional, IsString } from "class-validator";

export class UpdateAreaDto {
    @IsOptional()
    @IsString()
    name: string;

    // @IsOptional()
    // @IsInt()
    // department_id: number;

    @IsOptional()
    @IsString()
    responsible_user_id?: string;
}