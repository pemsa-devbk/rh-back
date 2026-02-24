import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { CreateRequestHolidaysDto } from "../Dto/holidays/create_request.dto";
import multer from "multer";
import { validArchivo } from "../middlewares/validationFile.middleware";
import { HolidayController } from "../controllers/holidays.controller";

// * Rutas
/**
 * Obtener vacaciones por usuario
 * crear vacaciones
 * cancelar vacacion
 * subir documento de vacaciones
 * descargar documento de vacaciones
 */
export class HolidayRoute {

    public upload = multer({
        storage: multer.memoryStorage(),
        fileFilter(req, file, callback) {
            if (file.mimetype !== 'application/pdf') return callback(new Error(`El archivo no tiene un formato soportado.`));
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024 // Máx 5MB
        }
    });
    constructor(
        public router = Router(),
        private readonly holidayController = new HolidayController()
    ) {
        this.initialize();
    }

    private initialize() {
        this.router.post('/users/:user_id/holidays', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateRequestHolidaysDto)], this.holidayController.create);
        this.router.get('/users/:user_id/holidays', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.holidayController.getHolidaysByUser);
        this.router.patch('/users/:user_id/holidays/:holiday_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.holidayController.cancel);
        this.router.get('/users/:user_id/holidays/:holiday_id/format', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.holidayController.getFormat);
        this.router.post('/users/:user_id/holidays/:holiday_id/format', [authentication, this.upload.single('document'), validArchivo, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.holidayController.uploadFormat);
    }
}

