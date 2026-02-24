import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { CreateCourseDTO } from "../Dto/course/createCourse.dto";
import { UpdateCourseDTO } from "../Dto/course/updateCourse.dto";
import { AssignUsersToCourseDTO } from "../Dto/course/assignUsersToCoruse.dto";
import { CourseController } from "../controllers/course.controller";
import multer from "multer";
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

function isValidFotmat(mimetype: string) {
    return mimetype.startsWith('image/') || mimetype.startsWith('application/pdf');
}

export class CourseRoute {
    private upload = multer({
            storage: multer.memoryStorage(),
            fileFilter(req, file, callback) {
                if (!isValidFotmat(file.mimetype)) {
                    return callback(new Error(`El archivo debe ser imagen o pdf.`));
                }
                callback(null, true);
            },
            limits: {
                fileSize: 5 * 1024 * 1024 // Máx 5MB
            }
        }); 
    constructor(
        public router = Router(),
        private readonly controller = new CourseController() 
    ){
        this.initialize();
    }

    private initialize(){
        this.router.post('/courses', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateCourseDTO)], this.controller.create);
        this.router.get('/courses', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getAll);
        this.router.get('/courses/:course_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getByID);
        this.router.delete('/courses/:course_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.delete);
        this.router.patch('/courses/:course_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateCourseDTO)], this.controller.update);

        // * Relaciones
        this.router.post('/courses/:course_id/users/:user_id/proof', [authentication, this.upload.single('proof'), validArchivo, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.uploadProof);
        this.router.get('/courses/:course_id/users/:user_id/proof', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.donwloadProof);
        this.router.get('/users/:user_id/courses', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getByUser);
        this.router.post('/courses/:course_id/users', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(AssignUsersToCourseDTO)], this.controller.assignUsers);
        this.router.delete('/courses/:course_id/users/:user_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.deleteUser);
    }
}