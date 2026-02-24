import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { PaginationDto } from "../Dto/pagination.dto";
import { StateService } from "../services/state.service";


export class StateController {
    constructor(
        private readonly service = new StateService()
    ) { }

    public create = async (req: Request, res: Response, next: NextFunction) => {
        const createDTO = req.body;
        try {
            const state = await this.service.create(createDTO);
            res.json(state)
        } catch (error) {
            next(error);
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query);
        try {
            const [states, total] = await this.service.getAll(pagination);
            res.json({
                data: states, total
            })
        } catch (error) {
            next(error);
        }
    }

    public getOne = async (req: Request, res: Response, next: NextFunction) => {
        const {code_state} = req.params;
        try {
            const state = await this.service.getOne(code_state);
            res.json(state);
        } catch (error) {
            next(error)
        }
    }

    public delete = async (req: Request, res: Response, next: NextFunction) => {
        const {code_state} = req.params;
        try {
            const state = await this.service.delete(code_state);
            res.json(state);
        } catch (error) {
            next(error)
        }
    }

    public update = async (req: Request, res: Response, next: NextFunction) => {
        const {code_state} = req.params;
        const updateDTO = req.body;
        try {
            const state = await this.service.update(code_state, updateDTO);
            res.json(state);
        } catch (error) {
            next(error)
        }
    }

}