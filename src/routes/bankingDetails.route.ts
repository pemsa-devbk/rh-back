import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { BankingDetailsDTO, UpdateBankingDetailsDTO } from "../Dto/user/complements/banking.dto";
import { BankingDetailsController } from "../controllers/bankingDetails.controller";

export class BankingDetailsRoute {
    constructor(
        public router = Router(),
        private readonly controller = new BankingDetailsController()
    ) {
        this.initialize();
    }

    private initialize() {
        this.router.post('/employees/:employee_id/banking-details', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(BankingDetailsDTO)], this.controller.create);
        this.router.patch('/employees/:employee_id/banking-details', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateBankingDetailsDTO)], this.controller.update)
        this.router.get('/employees/:employee_id/banking-details', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getOne)
    }
}