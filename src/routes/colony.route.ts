import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { ColonyController } from "../controllers/colony.controller";
import { CreateColonyDTO } from "../Dto/mx/colony/createColony.dto";
import { UpdateColonyDTO } from "../Dto/mx/colony/updateColony.dto";


export class ColonyRoute{
    constructor(
        public router = Router(),
        private readonly controller = new ColonyController()
    ){
        this.initialize();
    }

    private initialize(){
        this.router.post('/municipalities/:municipality_id/colonies', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateColonyDTO)], this.controller.create)
        this.router.get('/municipalities/:municipality_id/colonies/:colony_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getOne)
        this.router.patch('/municipalities/:municipality_id/colonies/:colony_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateColonyDTO)], this.controller.update )
        this.router.delete('/municipalities/:municipality_id/colonies/:colony_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.delete)
        this.router.get('/municipalities/:municipality_id/colonies', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getByMunicipality)
        
        // * Rutas relacionadas (+1 nivel)
        this.router.get('/states/:code_state/colonies', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getByState)

        // * rutas globales (sin contexto)
        this.router.get('/colonies', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getAll)
        this.router.get('/postal_code/:postal_code', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getByPostalCode)
    }
}