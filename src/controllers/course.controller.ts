import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { QueryRelationsDTO } from "../Dto/query_relations.dto";
import { AssignUsersToCourseDTO } from "../Dto/course/assignUsersToCoruse.dto";
import { CourseService } from "../services/course.service";

export class CourseController {
    constructor(
        private readonly courseService = new CourseService()
    ) { }

    public create = async (req: Request, res: Response, next: NextFunction) => {
        const courseDto = req.body;

        try {
            const course = await this.courseService.create(courseDto);
            res.json(course)
        } catch (error) {
            next(error)
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction) => {
        const pagination = plainToInstance(QueryRelationsDTO, req.query, { enableImplicitConversion: true });
        try {
            const [courses, total] = await this.courseService.getAll(pagination);
            res.json({
                data: courses,
                total
            })
        } catch (error) {
            next(error)
        }
    }

    public getByID = async (req: Request, res: Response, next: NextFunction) => {
        const { course_id } = req.params;
        try {
            const course = await this.courseService.getById(+course_id);
            res.json(course)
        } catch (error) {
            next(error)
        }
    }

    public delete = async (req: Request, res: Response, next: NextFunction) => {
        const { course_id } = req.params;
        try {
            const course = await this.courseService.delete(+course_id);
            res.json(course)
        } catch (error) {
            next(error)
        }
    }

    public update = async (req: Request, res: Response, next: NextFunction) => {
        const { course_id } = req.params;
        const updateDto = req.body;
        try {
            const course = await this.courseService.update(+course_id, updateDto);
            res.json(course)
        } catch (error) {
            next(error)
        }
    }
    //* Relaciones
    public uploadProof = async (req: Request, res: Response, next: NextFunction) => {
        const { course_id, user_id } = req.params;
        try {
            await this.courseService.uploadProof(+course_id, user_id, req.file);
            res.json({
                message: 'Comprobante actualizado'
            })
        } catch (error) {
            next(error);
        }
    }

    public donwloadProof = (req: Request, res: Response, next: NextFunction) => {
        const { course_id, user_id } = req.params;
        try {
            const [filename, dir, mimeType] = this.courseService.downloadProof(+course_id, user_id);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', mimeType);
            res.download(dir, filename, err => {
                if (err) {
                    res.status(500).json({ message: "Error al descargar el archivo" })
                }
            })
        } catch (error) {
            next(error);
        }
    }

    public getByUser = async (req: Request, res: Response, next: NextFunction) => {
        const { user_id } = req.params;
        const pagination = plainToInstance(QueryRelationsDTO, req.query);
        try {
            const [courses, total] = await this.courseService.getByUser(user_id, pagination)
            res.json({
                data: courses,
                total
            })
        } catch (error) {
            next(error)
        }
    }

    public assignUsers = async (req: Request, res: Response, next: NextFunction) => {
        const { course_id } = req.params;
        const assignUsersDto = plainToInstance(AssignUsersToCourseDTO, req.body);
        try {
            const response = await this.courseService.assignUsers(+course_id, assignUsersDto);
            if (!response) throw 'Error al asignar los usuarios';
            res.json({
                message: 'Se asignaron los usuarios'
            })
        } catch (error) {
            next(error)
        }
    }

    public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        const { course_id, user_id } = req.params;
        try {
            const response = await this.courseService.deleteUser(+course_id, user_id);
            if (!response) throw 'Error al eliminar el usuario del curso';
            res.json({
                message: 'Usuario eliminado del curso'
            })
        } catch (error) {
            next(error)
        }
    }
}