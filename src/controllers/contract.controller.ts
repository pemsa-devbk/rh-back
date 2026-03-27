import { NextFunction, Request, Response } from "express";
import { ContractService } from "../services/contract.service";

export class ContractController {
    constructor(
        private readonly service = new ContractService()
    ){}

    public create = async(req:Request, res: Response, next: NextFunction) => {
        const createDTO = req.body;
        const {employee_id} = req.params;
        try {
            const contract = await this.service.create(employee_id, createDTO);
            res.json(contract);
        } catch (error) {
            next(error);
        }
    }

    public getAll = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        try {
            const contract = await this.service.getAll(employee_id);
            res.json(contract);
        } catch (error) {
            next(error);
        }
    }

    public delete = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id, contract_id} = req.params;
        try {
            const contract = await this.service.delete(employee_id, +contract_id);
            res.json(contract);
        } catch (error) {
            next(error);
        }
    }
}