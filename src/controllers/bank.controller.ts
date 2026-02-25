import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { PaginationDto } from "../Dto/pagination.dto";
import { BankService } from "../services/bank.service";

export class BankController{
    constructor(
        private readonly service = new BankService()
    ){}

    public create = async(req:Request, res: Response, next: NextFunction) => {
        const createDTO = req.body;
        try {
            const bank = await this.service.create(createDTO);
            res.json(bank);
        } catch (error) {
            next(error);
        }
    }

    public getAll = async(req:Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query);
        try {
            const [banks, total] = await this.service.getAll(pagination);
            res.json({
                data: banks, total
            })
        } catch (error) {
            next(error);
        }
    }

    public getOne = async(req:Request, res: Response, next: NextFunction) => {
        const {bank_id} = req.params;
        try {
            const bank = await this.service.getOne(+bank_id);
            res.json(bank)
        } catch (error) {
            next(error);
        }
    }

    public update = async(req:Request, res: Response, next: NextFunction) => {
        const {bank_id} = req.params;
        const updateDTO = req.body;
        try {
            const bank = await this.service.update(+bank_id, updateDTO);
            res.json(bank);
        } catch (error) {
            next(error);
        }
    }

    public delete = async(req:Request, res: Response, next: NextFunction) => {
        const {bank_id} = req.params;
        try {
            const bank = await this.service.delete(+bank_id);
            res.json(bank); 
        } catch (error) {
            next(error);
        }
    }
}