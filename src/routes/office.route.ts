import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { validRoles } from "../types/enums/roles";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { OfficeController } from "../controllers/office.controller";
import { CreateOfficeDto } from "../Dto/office/createOffice.dto";
import { UpdateOfficeDto } from "../Dto/office/updateOffice.dto";

// * Rutas
/**
 * crear oficina
 * obtener oficinas
 * obtener por id
 * eliminar oficina
 * editar oficina
 * obtener oficinas por empresa
 */
export class OfficeRoute {

    constructor(
        public router = Router(),
        private officeController: OfficeController = new OfficeController(),
    ){
        this.initialize();
    }
    
    private initialize() {
        this.router.post('/enterprises/:enterprise_id/offices', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN]), validationMiddleware(CreateOfficeDto)], this.officeController.create);
        this.router.get('/enterprises/:enterprise_id/offices', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.officeController.getByEnterprise);
        this.router.get('/enterprises/:enterprise_id/offices/:office_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.officeController.getOne);
        this.router.delete('/enterprises/:enterprise_id/offices/:office_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.officeController.delete);
        this.router.patch('/enterprises/:enterprise_id/offices/:office_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN]), validationMiddleware(UpdateOfficeDto)], this.officeController.update);
        
        // * Rutas globales (sin contexto)
        this.router.get('/offices', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.officeController.getAll);
    }
}