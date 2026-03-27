import { IsDateString, IsIn, IsOptional, ValidateIf } from "class-validator";
import { SearchDTO } from "../pagination.dto";


export class SearchFile extends SearchDTO {
    @IsOptional()
    @IsIn(['name', 'key', 'valid_mime_types', 'description', 'created_at', 'is_active', 'is_required'])
    searchKey?: string;

    @IsOptional()
    @IsIn(['name', 'key', 'valid_mime_types', 'description', 'created_at', 'is_active', 'is_required'])
    orderBy?: string;

    @ValidateIf((o) => o.searchKey === "created_at")
    @IsOptional()
    @IsDateString({}, { message: "dateFrom debe tener formato YYYY-MM-DD" })
    dateFrom?: string;
    
}