import { NextFunction, Request, Response } from "express";
import { OfficeService } from "../services/office.service";
import { plainToInstance } from "class-transformer";
import { QueryRelationsDTO } from "../Dto/query_relations.dto";

export class OfficeController {
    constructor(
        private readonly officeService = new OfficeService()
    ){}

    public create = async(req: Request, res: Response, next: NextFunction) => {
        const createDto = req.body;
        const {enterprise_id} = req.params;
        try {
            const office = await this.officeService.create(createDto, enterprise_id);
            res.json(office)
        } catch (error) {
            next(error);
        }
    }

    public getAll = async(req: Request, res: Response, next: NextFunction)  => {
        const pagination = plainToInstance(QueryRelationsDTO, req.query);
        try {
            const [offices, total] = await this.officeService.getAll(pagination);
            res.json({
                data: offices,
                total
            })
        } catch (error) {
            next(error);
            
        }
    }

    public getOne = async(req: Request, res: Response, next: NextFunction) => {
        const {enterprise_id, office_id} = req.params;
        try {
            const office = await this.officeService.getOne( enterprise_id,+office_id);
            res.json(office)
        } catch (error) {
            next(error);
        }
    }

    public update = async(req: Request, res: Response, next: NextFunction) => {
        const {office_id, enterprise_id } = req.params;
        const updateDto =  req.body;
        try {
            const office = await this.officeService.update( enterprise_id, +office_id, updateDto);
            res.json(office)
        } catch (error) {
            next(error);
        }
    }

    public delete = async(req: Request, res: Response, next: NextFunction) => {
        const {office_id, enterprise_id} = req.params;
        try {
            const office = await this.officeService.delete(enterprise_id, +office_id);
            res.json(office)
        } catch (error) {
            next(error);
        }
    }

     public getByEnterprise = async(req: Request, res: Response, next: NextFunction)  => {
        const pagination = plainToInstance(QueryRelationsDTO, req.query);
        const { enterprise_id } = req.params;
        try {
            const [offices, total] = await this.officeService.getByEnterprise(enterprise_id, pagination);
            res.json({
                data: offices,
                total
            })
        } catch (error) {
            next(error);
        }
    }
}