import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { EnterpriseInformationController } from "../controllers/enterpriseInformation.controller";
import { EnterpriseInformationDTO, UpdateEnterpriseInformationDTO } from "../Dto/user/complements/enterpriseInformation.dto";

export class EnterpriseInformationRoute {
    constructor(
        public router = Router(),
        private readonly controller = new EnterpriseInformationController()
    ) {
        this.initialize();
    }

    private initialize() {
        this.router.post('/employees/:employee_id/enterprise-information', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(EnterpriseInformationDTO)], this.controller.create);
        this.router.patch('/employees/:employee_id/enterprise-information', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateEnterpriseInformationDTO)], this.controller.update)
        this.router.get('/employees/:employee_id/enterprise-information', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getOne)
    }
}