import { IsBoolean } from "class-validator";
import { PaginationDto } from "./pagination.dto";

export class QueryRelationsDTO extends PaginationDto{
    @IsBoolean()
    relations: boolean = false;
}