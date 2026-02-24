import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { CreateStateDTO } from "../Dto/mx/states/createState.dto";
import { UpdateStateDTO } from "../Dto/mx/states/updateState.dto";
import { StateController } from "../controllers/state.controller";


export class StateRoute{
    constructor(
        public router = Router(),
        private readonly controller = new StateController()
    ){
        this.initialize();
    }

    private initialize(){
        this.router.post('/states', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateStateDTO)], this.controller.create)
        this.router.get('/states', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getAll)
        this.router.get('/states/:code_state', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getOne)
        this.router.patch('/states/:code_state', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateStateDTO)], this.controller.update )
        this.router.delete('/states/:code_state', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.delete)
    }
}