import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { ContractController } from "../controllers/contract.controller";
import { ContractDTO } from "../Dto/user/complements/contract.dto";

export class ContractRoute {
    constructor(
        public router = Router(),
        private readonly controller = new ContractController()
    ) {
        this.initialize();
    }

    private initialize() {
        this.router.post('/employees/:employee_id/contracts', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(ContractDTO)], this.controller.create);
        this.router.delete('/employees/:employee_id/contracts/:contract_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), ], this.controller.delete)
        this.router.get('/employees/:employee_id/contracts', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getAll)
    }
}