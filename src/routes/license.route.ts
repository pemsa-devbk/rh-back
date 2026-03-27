import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { LicenseDTO, UpdateLicenseDto } from "../Dto/user/complements/license.dto";
import { LicenseController } from "../controllers/license.controller";

export class LicenseRoute {
    constructor(
        public router = Router(),
        private readonly controller = new LicenseController()
    ) {
        this.initialize();
    }

    private initialize() {
        this.router.post('/employees/:employee_id/license', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(LicenseDTO)], this.controller.create);
        this.router.patch('/employees/:employee_id/license', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateLicenseDto)], this.controller.update)
        this.router.get('/employees/:employee_id/license', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getOne)
    }
}