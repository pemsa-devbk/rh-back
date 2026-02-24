import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { PaginationDto } from "../Dto/pagination.dto";
import { DepartmentService } from "../services/department.service";

export class DepartmentController {
    constructor(
        private readonly service = new DepartmentService()
    ) { }

    public create = async (req: Request, res: Response, next: NextFunction) => {
        const departmentDto = req.body;
        const { office_id } = req.params;
        try {
            const departmen = await this.service.create(departmentDto, +office_id);
            res.json(departmen);
        } catch (error) {
            next(error);
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query);
        try {
            const [departments, total] = await this.service.getAll(pagination);
            res.json({
                data: departments,
                total
            });
        } catch (error) {
            next(error);
        }
    }

    public getOne = async (req: Request, res: Response, next: NextFunction) => {
        const { office_id, department_id } = req.params;
        try {
            const department = await this.service.getOne(+office_id, +department_id);
            res.json(department);
        } catch (error) {
            next(error);
        }
    }

    public delete = async (req: Request, res: Response, next: NextFunction) => {
        const { office_id, department_id } = req.params;
        try {
            const department = await this.service.delete(+office_id, +department_id);
            res.json(department);
        } catch (error) {
            next(error);
        }
    }

    public update = async (req: Request, res: Response, next: NextFunction) => {
        const { office_id, department_id } = req.params;
        const updateDTO = req.body;
        try {
            const department = await this.service.update(+office_id, +department_id, updateDTO);
            res.json(department);
        } catch (error) {
            next(error);
        }
    }

    public getByOffice = async (req: Request, res: Response, next: NextFunction) => {
        const { office_id } = req.params;
        const pagination = plainToInstance(PaginationDto, req.query);
        try {
            const [departments, total] = await this.service.getByOffice(+office_id, pagination);
            res.json({
                data: departments,
                total
            });
        } catch (error) {
            next(error);
        }
    }

    public getByEnterprise = async (req: Request, res: Response, next: NextFunction) => {
        const { enterprise_id } = req.params;
        const pagination = plainToInstance(PaginationDto, req.query);
        try {
            const [departments, total] = await this.service.getByEnterprise(enterprise_id, pagination);
            res.json({
                data: departments,
                total
            })
        } catch (error) {
            next(error);
        }
    }
}