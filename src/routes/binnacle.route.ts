import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { BinnacleController } from "../controllers/binnacle.controller";

export class BinnacleRoute {
    constructor(
        public router = Router(),
        private readonly binnacleController = new BinnacleController()
    ){
        this.initialize();
    }

    private initialize(){
        this.router.get('/users/:user_id/binnacles/modifier', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.binnacleController.getByModifier);
        this.router.get('/users/:user_id/binnacles/modified', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.binnacleController.getByModified);
    }
}