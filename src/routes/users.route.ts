import { Router } from "express";
import { UserController } from "../controllers/users.controller";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { authentication } from "../middlewares/auth.middleware";
import multer from 'multer';
import { validArchivo } from "../middlewares/validationFile.middleware";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { upDateUserDTO } from "../Dto/user/upDateUser.dto";

// Validar si es una imagen
function isImage(mimetype: string) {
    return mimetype.startsWith('image/');
}

// * Rutas
/**
 * Crear usuario
 * obtener usuarios
 * obtener usuario por id
 * editar usuario
 * actualizar foto del usuario
 * actualizar firma del usuario
 * obtener foto ??
 * 
 */
export class UserRoute {

    private upload = multer({
        storage: multer.memoryStorage(),
        fileFilter(req, file, callback) {
            if (['foto', 'firma'].includes(file.fieldname) && !isImage(file.mimetype)) {
                return callback(new Error(`El campo "${file.fieldname}" debe ser una imagen.`));
            }
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024 // Máx 5MB
        }
    });

    constructor(
        public router = Router(),
        private readonly userController = new UserController()
    ) {
        this.initialize();
    }

    private initialize() {

        // this.router.post('/users', [authentication, this.upload.fields([{ name: 'foto', maxCount: 1 }, { name: 'firma', maxCount: 1 }]), validArchivo, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.userController.create)
        // this.router.post('/users', [authentication, validArchivo, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.userController.create)
        // this.router.get('/users', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.userController.getAll)
        // this.router.get('/users/:user_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.QUERY,validRoles.SUPER_USER])], this.userController.getOne)
        // this.router.patch('/users/:user_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(upDateUserDTO)], this.userController.update);
        // // TODO Falta delete

        // // * Archivos 
        // // ? Posibilidad de pasar a file service
        // this.router.put('/users/:id/foto', [authentication, this.upload.single('foto'), validArchivo, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.userController.updatePhoto);
        // this.router.put('/users/:id/firma', [authentication, this.upload.single('firma'), validArchivo, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.userController.updateFirma);
        // // ? Posibilidad de pasar a file service
        // this.router.get('/users/photo/:id', this.userController.getPhoto);

        // // * Relaciones
        // this.router.get('/enterprises/:enterprise_id/users', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.userController.getByEnterprise)
        // this.router.get('/offices/:office_id/users', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.userController.getByOffice)
        // this.router.get('/areas/:area_id/users', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.userController.getByArea)
        // this.router.get('/positions/:position_id/users', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.userController.getByPosition)
        // this.router.get('/courses/:course_id/users', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.userController.getByCourse)
        
        // this.router.get('/users/:id/signature', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_USER])], this.userController.getSignature);
        // this.router.get('/users/:id/credencial', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.userController.getCredential);


        // // ? Validar uso
        // this.router.patch('/users/status/:id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_USER])], this.userController.updateStatus)

        // // * Rutas publicas
        // this.router.get('/users/public/:id', this.userController.getPublicUser);
    }

}