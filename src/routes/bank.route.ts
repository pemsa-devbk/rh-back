import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { CreateBankDTO } from "../Dto/bank/createBank.dto";
import { UpdateBankDTO } from "../Dto/bank/updateBank.dto";
import { BankController } from "../controllers/bank.controller";


export class BankRoute{
    constructor(
        public router = Router(),
        private readonly controller = new BankController()
    ){
        this.initialize();
    }

    private initialize(){
        this.router.post('/banks', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateBankDTO)], )
        this.router.get('/banks', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], )
        this.router.get('/banks/:bank_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], )
        this.router.patch('/banks/:bank_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateBankDTO)], )
        this.router.delete('/banks/:bank_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], )
    }
}