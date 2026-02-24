import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { CreatePositionDto } from "../Dto/position/createPosition.dto";
import { PositionController } from "../controllers/position.controller";
import { UpdatePositionDto } from "../Dto/position/updatePosition.dto";

// * Rutas
/**
 * crear puesto
 * ver puestos
 * eliminar puesto
 * editar puesto
 * obtener puesto
 * obtener puestos por area
 * obtener puestos por departamento
 * obtener puestos por oficina
 * obtener puestos por empresa
 */
export class PositionRoute {
    constructor(
        public router = Router(),
        private positionController = new PositionController()
    ) {
        this.initialize();
    }

    private initialize() {
        this.router.post('/areas/:area_id/positions', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreatePositionDto)], this.positionController.create);
        this.router.delete('/areas/:area_id/positions/:position_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.positionController.delete);
        this.router.patch('/areas/:area_id/positions/:position_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdatePositionDto)], this.positionController.update);
        this.router.get('/areas/:area_id/positions/:position_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.positionController.getByID)
        this.router.get('/areas/:area_id/positions', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.positionController.getByArea)
        // * Rutas relacionadas (+1 nivel)
        this.router.get('/departments/:department_id/positions', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.positionController.getByDepartment)
        this.router.get('/offices/:office_id/positions', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.positionController.getByOffice)
        this.router.get('/enterprises/:enterprise_id/positions', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.positionController.getByEnterprise)

        // *rutas globales (sin contexto)
        this.router.get('/positions', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.positionController.getAll)
    }
}