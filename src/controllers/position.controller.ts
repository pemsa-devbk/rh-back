import { NextFunction, Request, Response } from "express";
import { PositionService } from "../services/position.service";
import { plainToInstance } from "class-transformer";
import { QueryRelationsDTO } from "../Dto/query_relations.dto";

export class PositionController {
    constructor(
        private positionService: PositionService = new PositionService()
    ) { }

    public create = async (req: Request, res: Response, next: NextFunction) => {
        const positionDto = req.body;
        const { area_id } = req.params;
        try {
            const position = await this.positionService.create(+area_id, positionDto);
            res.json(position)
        } catch (error) {
            next(error);
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(QueryRelationsDTO, req.query);
        try {
            const [positions, total] = await this.positionService.getAll(pagination);
            res.json({
                data: positions, total
            })
        } catch (error) {
            next(error);
        }
    }

    public getByID = async (req: Request, res: Response, next: NextFunction) => {
        const { position_id, area_id } = req.params;
        try {
            const position = await this.positionService.getOne(+area_id, +position_id);
            res.json(position)
        } catch (error) {
            next(error);
        }
    }

    public delete = async (req: Request, res: Response, next: NextFunction) => {
        const { position_id, area_id } = req.params;
        try {
            const position = await this.positionService.delete(+area_id, +position_id);
            res.json(position)
        } catch (error) {
            next(error);
        }
    }

    public update = async (req: Request, res: Response, next: NextFunction) => {
        const { position_id, area_id } = req.params;
        const updateDto = req.body;
        try {
            const position = await this.positionService.update(+area_id, +position_id, updateDto);
            res.json(position)
        } catch (error) {
            next(error);
        }
    }

    public getByArea = async (req: Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(QueryRelationsDTO, req.query);
        const { area_id } = req.params;
        try {
            const [positions, total] = await this.positionService.getByArea(+area_id, pagination);
            res.json({
                data: positions, total
            })
        } catch (error) {
            next(error);
        }
    }

    public getByDepartment = async (req: Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(QueryRelationsDTO, req.query);
        const { department_id } = req.params;
        try {
            const [positions, total] = await this.positionService.getByDepartment(+department_id, pagination);
            res.json({
                data: positions, total
            })
        } catch (error) {
            next(error);
        }
    }

    public getByOffice = async (req: Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(QueryRelationsDTO, req.query);
        const { office_id } = req.params;
        try {
            const [positions, total] = await this.positionService.getByOffice(+office_id, pagination);
            res.json({
                data: positions, total
            })
        } catch (error) {
            next(error);
        }
    }

    public getByEnterprise = async (req: Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(QueryRelationsDTO, req.query);
        const { enterprise_id } = req.params;
        try {
            const [positions, total] = await this.positionService.getByEnterprise(enterprise_id, pagination);
            res.json({
                data: positions, total
            })
        } catch (error) {
            next(error);
        }
    }
}