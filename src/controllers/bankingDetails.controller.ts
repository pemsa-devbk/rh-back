import { NextFunction, Request, Response } from "express";
import { BankingDetailsService } from "../services/bankingDeatils.service";

export class BankingDetailsController {
    constructor(
        private readonly service = new BankingDetailsService()
    ){}

    public create = async(req:Request, res: Response, next: NextFunction) => {
        const createDTO = req.body;
        const {employee_id} = req.params;
        try {
            const bankingDetails = await this.service.create(employee_id, createDTO);
            res.json(bankingDetails);
        } catch (error) {
            next(error);
        }
    }

    public getOne = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        try {
            const bankingDetails = await this.service.getOne(employee_id);
            res.json(bankingDetails);
        } catch (error) {
            next(error);
        }
    }

    public update = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        const updateDTO = req.body;
        try {
            const bankingDetails = await this.service.update(employee_id, updateDTO);
            res.json(bankingDetails);
        } catch (error) {
            next(error);
        }
    }
}