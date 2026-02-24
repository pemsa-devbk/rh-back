import { NextFunction, Request, Response } from "express";
import { AreaService } from "../services/area.service";
import { plainToInstance } from "class-transformer";
import { QueryRelationsDTO } from "../Dto/query_relations.dto";

export class AreaController {

    constructor(
        private readonly areaService = new AreaService(),
    ) { }

    public create = async (req: Request, res: Response, next: NextFunction) => {
        const areaDto = req.body;
        const { department_id } = req.params;
        try {
            const area = await this.areaService.create(areaDto, +department_id);
            res.json(area)
        } catch (error) {
            next(error);
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(QueryRelationsDTO, req.query);
        try {
            const [areas, total] = await this.areaService.getAll(pagination);
            res.json({
                data: areas,
                total
            })
        } catch (error) {
            next(error);
        }
    }

    public getOne = async (req: Request, res: Response, next: NextFunction) => {
        const { area_id, department_id } = req.params;
        try {
            const area = await this.areaService.getOne(+department_id, +area_id);
            res.json(area)
        } catch (error) {
            next(error);
        }
    }

    public delete = async (req: Request, res: Response, next: NextFunction) => {
        const { area_id, department_id } = req.params;
        try {
            const area = await this.areaService.delete(+department_id, +area_id);
            res.json(area)
        } catch (error) {
            next(error);
        }
    }

    public update = async (req: Request, res: Response, next: NextFunction) => {
        const { area_id, department_id } = req.params;
        try {
            const updateDto = req.body;
            const area = await this.areaService.update(+department_id, +area_id, updateDto);
            res.json(area)
        } catch (error) {
            next(error);
        }
    }

    public getByDepartment = async (req: Request, res: Response, next: NextFunction) => {
        const { department_id } = req.params;
        const pagination = plainToInstance(QueryRelationsDTO, req.query);
        try {
            const [areas, total] = await this.areaService.getByDepartment(+department_id, pagination);
            res.json({
                data: areas,
                total
            })
        } catch (error) {
            next(error);
        }
    }

    public getByOffice = async (req: Request, res: Response, next: NextFunction) => {
        const { office_id } = req.params;
        const pagination = plainToInstance(QueryRelationsDTO, req.query);
        try {
            const [areas, total] = await this.areaService.getByOffice(+office_id, pagination);
            res.json({
                data: areas,
                total
            })
        } catch (error) {
            next(error);
        }
    }

    public getByEnterprise = async (req: Request, res: Response, next: NextFunction) => {
        const { enterprise_id } = req.params;
        const pagination = plainToInstance(QueryRelationsDTO, req.query);
        try {
            const [areas, total] = await this.areaService.getByEnterprice(enterprise_id, pagination);
            res.json({
                data: areas,
                total
            })
        } catch (error) {
            next(error);
        }
    }
}