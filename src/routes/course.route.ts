import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { CreateCourseDTO } from "../Dto/course/createCourse.dto";
import { UpdateCourseDTO } from "../Dto/course/updateCourse.dto";
import { AssignUsersToCourseDTO } from "../Dto/course/assignUsersToCoruse.dto";
import { CourseController } from "../controllers/course.controller";
import { validArchivo } from "../middlewares/validationFile.middleware";

// * Rutas
/**
 * Crear curso
 * obtener cursos
 * obtener curso por id
 * eliminar curso
 * editar curso
 * obtener cursos de un usuario
 * asignar usuarios a un curso
 * eliminar usuario de curso
 */

export class CourseRoute {
    
    constructor(
        public router = Router(),
        private readonly controller = new CourseController() 
    ){
        this.initialize();
    }

    private initialize(){
        this.router.post('/courses', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN]), validationMiddleware(CreateCourseDTO)], this.controller.create);
        this.router.get('/courses', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.controller.getAll);
        this.router.get('/courses/:course_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.controller.getByID);
        this.router.delete('/courses/:course_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.controller.delete);
        this.router.patch('/courses/:course_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN]), validationMiddleware(UpdateCourseDTO)], this.controller.update);

        // * Relaciones
        this.router.post('/courses/:course_id/employees/:employee_id/proof', [authentication, validArchivo, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.controller.uploadProof);
        this.router.get('/courses/:course_id/employees/:employee_id/proof', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.controller.donwloadProof);

        this.router.get('/employees/:employee_id/courses', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.controller.getByEmployee);

        this.router.post('/courses/:course_id/users', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN]), validationMiddleware(AssignUsersToCourseDTO)], this.controller.assignUsers);
        this.router.delete('/courses/:course_id/users/:user_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.controller.deleteUser);
    }
}