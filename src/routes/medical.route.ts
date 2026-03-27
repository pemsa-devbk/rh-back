import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { MedicalDataDTO, UpdateMedicalDataDTO } from "../Dto/user/complements/medical.dto";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { MedicalController } from "../controllers/medical.controller";

export class MedicalRoute {
    constructor(
        public router = Router(),
        private readonly controller = new MedicalController()
    ) {
        this.initialize();
    }

    private initialize() {
        this.router.post('/employees/:employee_id/medical', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(MedicalDataDTO)], this.controller.create);
        this.router.patch('/employees/:employee_id/medical', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateMedicalDataDTO)], this.controller.update)
        this.router.get('/employees/:employee_id/medical', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getOne)
    }
}