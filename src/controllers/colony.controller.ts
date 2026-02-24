import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { PaginationDto } from "../Dto/pagination.dto";
import { ColonyService } from "../services/colony.service";


export class ColonyController {
    constructor(
        private readonly service = new ColonyService()
    ) { }

    public create = async (req: Request, res: Response, next: NextFunction) => {
        const createDTO = req.body;
        const { municipality_id } = req.params;
        try {
            const colony = await this.service.create(municipality_id, createDTO);
            res.json(colony)
        } catch (error) {
            next(error);
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query);
        try {
            const [colonies, total] = await this.service.getAll(pagination);
            res.json({
                data: colonies, total
            })
        } catch (error) {
            next(error);
        }
    }

    public getOne = async (req: Request, res: Response, next: NextFunction) => {
        const { colony_id, municipality_id } = req.params;
        try {
            const colony = await this.service.getOne(municipality_id, +colony_id);
            res.json(colony);
        } catch (error) {
            next(error)
        }
    }

    public getByPostalCode = async (req: Request, res: Response, next: NextFunction) => {
        const { postal_code } = req.params;
        try {
            const postalCode = await this.service.getByPostalCode(postal_code);
            res.json(postalCode);
        } catch (error) {
            next(error)
        }
    }

    public delete = async (req: Request, res: Response, next: NextFunction) => {
        const { colony_id, municipality_id } = req.params;
        try {
            const colony = await this.service.delete(municipality_id, +colony_id);
            res.json(colony);
        } catch (error) {
            next(error)
        }
    }

    public update = async (req: Request, res: Response, next: NextFunction) => {
        const { colony_id, municipality_id } = req.params;
        const updateDTO = req.body;
        try {
            const colony = await this.service.update( municipality_id, +colony_id, updateDTO);
            res.json(colony);
        } catch (error) {
            next(error)
        }
    }

    public getByState = async (req: Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query);
        const { code_state } = req.params;

        try {
            const [colonies, total] = await this.service.getByState(code_state, pagination);
            res.json({
                data: colonies, total
            })
        } catch (error) {
            next(error);
        }
    }

    public getByMunicipality = async (req: Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query);
        const { municipality_id } = req.params;

        try {
            const [colonies, total] = await this.service.getByMunicipality(municipality_id, pagination);
            res.json({
                data: colonies, total
            })
        } catch (error) {
            next(error);
        }
    }

}