import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { PaginationDto } from "../Dto/pagination.dto";

export class BankController{
    constructor(

    ){}

    public create = (req:Request, res: Response, next: NextFunction) => {
        const createDTO = req.body;
        try {

        } catch (error) {
            next(error);
        }
    }

    public getAll = (req:Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query);

        try {
        } catch (error) {
            next(error);
        }
    }

    public getOne = (req:Request, res: Response, next: NextFunction) => {
        const {bank_id} = req.params;
        try {
            
        } catch (error) {
            next(error);
        }
    }

    public update = (req:Request, res: Response, next: NextFunction) => {
        const {bank_id} = req.params;
        try {
            
        } catch (error) {
            next(error);
        }
    }

    public delete = (req:Request, res: Response, next: NextFunction) => {
        const {bank_id} = req.params;
        try {
            
        } catch (error) {
            next(error);
        }
    }
}