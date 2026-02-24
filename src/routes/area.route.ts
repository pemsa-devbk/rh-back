import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { AreaController } from "../controllers/area.controller";
import { validRoles } from "../types/enums/roles";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { CreateAreaDto } from "../Dto/area/createArea.dto";
import { UpdateAreaDto } from "../Dto/area/updateArea.dto";

//* Rutas
/**
 * crear area
 * obtener areas
 * obtener area por id
 * eliminar area
 * editar area
 * obtener areas por departamento
 * obtener areas por oficina
 * obtener areas por empresa
 */
export class AreaRoute {

    constructor(
        public router = Router(),
        private areaController: AreaController = new AreaController(),
    ){
        this.initialize();
    }
    
    private initialize() {
        this.router.post('/departments/:department_id/areas', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateAreaDto)], this.areaController.create);
        this.router.get('/departments/:department_id/areas/:area_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.areaController.getOne);
        this.router.delete('/departments/:department_id/areas/:area_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.areaController.delete);
        this.router.patch('/departments/:department_id/areas/:area_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateAreaDto)], this.areaController.update);
        this.router.get('/departments/:department_id/areas', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.areaController.getByDepartment);
        
        // * Rutas relacionadas (+1 nivel)
        this.router.get('/enterprises/:enterprise_id/areas', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.areaController.getByEnterprise);
        this.router.get('/offices/:office_id/areas', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.areaController.getByOffice);
        
        // * Rutas globales (sin contexto)
        this.router.get('/areas', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.areaController.getAll);
    }
}