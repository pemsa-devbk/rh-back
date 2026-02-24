import { IsOptional, IsString } from "class-validator";

export class CreateAreaDto {
    @IsString()
    name: string;
    
    @IsOptional()
    @IsString()
    responsible_user_id?: string;

}