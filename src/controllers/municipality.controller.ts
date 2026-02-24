import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { PaginationDto } from "../Dto/pagination.dto";
import { MunicipalityService } from "../services/municipality.service";


export class MunicipalityController {
    constructor(
        private readonly service = new MunicipalityService()
    ) { }

    public create = async (req: Request, res: Response, next: NextFunction) => {
        const createDTO = req.body;
        const { code_state } = req.params;
        try {
            const municipality = await this.service.create(code_state, createDTO);
            res.json(municipality)
        } catch (error) {
            next(error);
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query);
        try {
            const [municipalities, total] = await this.service.getAll(pagination);
            res.json({
                data: municipalities, total
            })
        } catch (error) {
            next(error);
        }
    }

    public getOne = async (req: Request, res: Response, next: NextFunction) => {
        const { code_state, municipality_id } = req.params;
        try {
            const municipality = await this.service.getOne(code_state, municipality_id);
            res.json(municipality);
        } catch (error) {
            next(error)
        }
    }

    public delete = async (req: Request, res: Response, next: NextFunction) => {
        const { code_state, municipality_id } = req.params;
        try {
            const municipality = await this.service.delete(code_state, municipality_id);
            res.json(municipality);
        } catch (error) {
            next(error)
        }
    }

    public update = async (req: Request, res: Response, next: NextFunction) => {
        const { code_state, municipality_id } = req.params;
        const updateDTO = req.body;
        try {
            const municipality = await this.service.update(code_state, municipality_id, updateDTO);
            res.json(municipality);
        } catch (error) {
            next(error)
        }
    }

    public getByState = async (req: Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query);
        const { code_state } = req.params;

        try {
            const [municipalities, total] = await this.service.getByState(code_state, pagination);
            res.json({
                data: municipalities, total
            })
        } catch (error) {
            next(error);
        }
    }

}