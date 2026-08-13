import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { CreateRequestHolidaysDto } from "../Dto/holidays/create_request.dto";
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

    constructor(
        public router = Router(),
        private readonly holidayController = new HolidayController()
    ) {
        this.initialize();
    }

    private initialize() {
        this.router.get('/employees/:employee_id/holidays', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.holidayController.getHolidaysByUser);
        this.router.post('/employees/:employee_id/holidays', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN]), validationMiddleware(CreateRequestHolidaysDto)], this.holidayController.create);
        this.router.patch('/employees/:employee_id/holidays/:holiday_id/cancel', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.holidayController.cancel);
        this.router.post('/employees/:employee_id/holidays/:holiday_id/proof', [authentication,  validArchivo, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.holidayController.uploadFormat);
        this.router.get('/employees/:employee_id/holidays/:holiday_id/proof', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.holidayController.getFormat);

    }
}
