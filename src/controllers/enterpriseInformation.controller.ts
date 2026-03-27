import { NextFunction, Request, Response } from "express";
import { EnterpriseInformationService } from "../services/enterpriseInformation.service";

export class EnterpriseInformationController {
    constructor(
        private readonly service = new EnterpriseInformationService()
    ){}

    public create = async(req:Request, res: Response, next: NextFunction) => {
        const createDTO = req.body;
        const {employee_id} = req.params;
        try {
            const enterpriseInformation = await this.service.create(employee_id, createDTO);
            res.json(enterpriseInformation);
        } catch (error) {
            next(error);
        }
    }

    public getOne = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        try {
            const enterpriseInformation = await this.service.getOne(employee_id);
            res.json(enterpriseInformation);
        } catch (error) {
            next(error);
        }
    }

    public update = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        const updateDTO = req.body;
        try {
            const enterpriseInformation = await this.service.update(employee_id, updateDTO);
            res.json(enterpriseInformation);
        } catch (error) {
            next(error);
        }
    }
}