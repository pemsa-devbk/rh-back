import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { PaginationDto } from "../Dto/pagination.dto";
import { BinncacleService } from "../services/binnacle.service";

export class BinnacleController {
    constructor(
        private readonly binnacleService = new BinncacleService()
    ){}
    public getByModified = async(req: Request, res: Response, next: NextFunction) => {
        const paginationDto = plainToInstance(PaginationDto, req.query);
        const {user_id} = req.params;
        try {
            const [binnacle, total] = await this.binnacleService.getByModified(user_id, paginationDto);
            res.json({
                data: binnacle, total
            })
        } catch (error) {
            next(error)
        }
    }

    public getByModifier = async(req: Request, res: Response, next: NextFunction) => {
        const paginationDto = plainToInstance(PaginationDto, req.query);
        const {user_id} = req.params;
        try {
            const [binnacle, total] = await this.binnacleService.getByModifier(user_id, paginationDto);
            res.json({
                data: binnacle, total
            })
        } catch (error) {
            next(error)
        }
    }
}
