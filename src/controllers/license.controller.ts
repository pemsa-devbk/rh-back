import { NextFunction, Request, Response } from "express";
import { LicenseService } from "../services/license.service";

export class LicenseController {
    constructor(
        private readonly service = new LicenseService()
    ){}

    public create = async(req:Request, res: Response, next: NextFunction) => {
        const createDTO = req.body;
        const {employee_id} = req.params;
        try {
            const license = await this.service.create(employee_id, createDTO);
            res.json(license);
        } catch (error) {
            next(error);
        }
    }

    public getOne = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        try {
            const license = await this.service.getOne(employee_id);
            res.json(license);
        } catch (error) {
            next(error);
        }
    }

    public update = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        const updateDTO = req.body;
        try {
            const license = await this.service.update(employee_id, updateDTO);
            res.json(license);
        } catch (error) {
            next(error);
        }
    }
}