import { NextFunction, Request, Response } from "express";
import { MedicalService } from "../services/medical.service";

export class MedicalController {
    constructor(
        private readonly service = new MedicalService()
    ){}

    public create = async(req:Request, res: Response, next: NextFunction) => {
        const createDTO = req.body;
        const {employee_id} = req.params;
        try {
            const medical = await this.service.create(employee_id, createDTO);
            res.json(medical);
        } catch (error) {
            next(error);
        }
    }

    public getOne = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        try {
            const medical = await this.service.getOne(employee_id);
            res.json(medical);
        } catch (error) {
            next(error);
        }
    }

    public update = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        const updateDTO = req.body;
        try {
            const medical = await this.service.update(employee_id, updateDTO);
            res.json(medical);
        } catch (error) {
            next(error);
        }
    }
}