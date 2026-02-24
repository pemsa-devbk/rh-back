import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { MunicipalityController } from "../controllers/municipality.controller";
import { CreateMunicipalityDTO } from "../Dto/mx/municipality/createMunicipality.dto";
import { UpdateMunicipalityDTO } from "../Dto/mx/municipality/updateMunicipality.dto";


export class MunicipalityRoute{
    constructor(
        public router = Router(),
        private readonly controller = new MunicipalityController()
    ){
        this.initialize();
    }

    private initialize(){
        this.router.post('/states/:code_state/municipalities', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateMunicipalityDTO)], this.controller.create)
        this.router.get('/states/:code_state/municipalities/:municipality_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getOne)
        this.router.patch('/states/:code_state/municipalities/:municipality_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateMunicipalityDTO)], this.controller.update )
        this.router.delete('/states/:code_state/municipalities/:municipality_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.delete)
        this.router.get('/states/:code_state/municipalities', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getByState)
        
        // * rutas globales (sin contexto)
        this.router.get('/municipalities', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getAll)
    }
}