import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { PaginationDto } from "../Dto/pagination.dto";
import { EmployeeService } from "../services/employee.service";

export class EmployeeController{
    constructor(
        private readonly service = new EmployeeService()
    ){}

    public create = async(req:Request, res: Response, next: NextFunction) => {
        const createDTO = req.body;
        try {
            const employee = await this.service.create(createDTO, req.user);
            res.json(employee)
        } catch (error) {
            next(error);
        }
    }

    public getAll = async(req:Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query, {enableImplicitConversion: true});
        try {
            const [employees, total] = await this.service.getAll(pagination);
            res.json({
                data: employees, total
            })
        } catch (error) {
            next(error);
        }
    }

     public getByPosition = async(req:Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query,{enableImplicitConversion: true});
        const {position_id} = req.params;
        try {
            const [employees, total] = await this.service.getByPosition(+position_id, pagination);
            res.json({
                data: employees, total
            })
        } catch (error) {
            next(error);
        }
    }

    public getByArea = async(req:Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query);
        const {area_id} = req.params;
        try {
            const [employees, total] = await this.service.getByArea(+area_id, pagination);
            res.json({
                data: employees, total
            })
        } catch (error) {
            next(error);
        }
    }

    public getByDepartment = async(req:Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query);
        const {department_id} = req.params;
        try {
            const [employees, total] = await this.service.getByDepartment(+department_id, pagination);
            res.json({
                data: employees, total
            })
        } catch (error) {
            next(error);
        }
    }

    public getByOffice = async(req:Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query);
        const {office_id} = req.params;
        try {
            const [employees, total] = await this.service.getByOffice(+office_id, pagination);
            res.json({
                data: employees, total
            })
        } catch (error) {
            next(error);
        }
    }

    public getByEnterprise = async(req:Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query);
        const {enterprise_id} = req.params;
        try {
            const [employees, total] = await this.service.getByEnterprise(enterprise_id, pagination);
            res.json({
                data: employees, total
            })
        } catch (error) {
            next(error);
        }
    }

    public getByCourse = async(req:Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(PaginationDto, req.query);
        const {course_id} = req.params;
        try {
            const [employees, total] = await this.service.getByCourse(+course_id, pagination);
            res.json({
                data: employees, total
            })
        } catch (error) {
            next(error);
        }
    }


    public getOne = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        try {
            const employee = await this.service.getOne(employee_id);
            res.json(employee)
        } catch (error) {
            next(error);
        }
    }

    public getPublic = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        try {
            const employee = await this.service.getPublicEmployee(employee_id);
            res.json(employee)
        } catch (error) {
            next(error);
        }
    }

    public update = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        const updateDTO = req.body;
        try {
            const employee = await this.service.update(employee_id, updateDTO, req.user);
            res.json(employee);
        } catch (error) {
            next(error);
        }
    }

    public delete = async(req:Request, res: Response, next: NextFunction) => {
        const {user_id} = req.params;
        try {
            const employee = await this.service.delete(user_id);
            res.json(employee)
        } catch (error) {
            next(error);
        }
    }

    // TODO Implementar con correo y hacer ruta
    // public passwordReset = async(req:Request, res: Response, next: NextFunction) => {
    //     const {employee_id} = req.params;
    //     try {
    //         const employee = await this.service.update(employee_id, req.user);
    //         res.json(employee);
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // !
    public toggleStatus = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        try {
            const employee = await this.service.toggleStatus(employee_id, req.user);
            res.json(employee);
        } catch (error) {
            next(error);
        }
    }

    

    public changePassword = async(req:Request, res: Response, next: NextFunction) => {
        const body = req.body;
        try {
            const msg = await this.service.changePassword(body, req.user);
            res.json({msg});
        } catch (error) {
            next(error);
        }
    }

    public myInfo = async(req:Request, res: Response, next: NextFunction) => {
        console.log('AHHHHHHHHHHHHHHHH');
        try {
            const employee = await this.service.myInfo( req.user);
            console.log(employee);
            
            res.json(employee);
        } catch (error) {
            next(error);
        }
    }

}