import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { EnterpriceController } from "../controllers/enterprice.controller";
import { CreateEnterpriseDTO } from "../Dto/enterprise/createEnterprise.dto";
import { UpdateEnterpriseDTO } from "../Dto/enterprise/updateEnterprise.dto";
import { UpdateSignatureDto } from "../Dto/enterprise/updateSignature.dto";
import { NewSignatureDto } from "../Dto/enterprise/newSignature.dto";

// * Rutas
/**
 * crear empresa
 * obtener empresas
 * obtener empresa por id
 * editar empresa 
 * eliminar empresa
 * visualizar firma
 * crear firma
 * obtener firma
 * actualizar firma
 * descargar firma
 */

export class EnterpriseRoute {


    constructor(
        public router = Router(),
        private readonly enterpreiceCotroller = new EnterpriceController()
    ) {
        this.initialize();
    }

    private initialize() {
        this.router.post('/enterprises', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateEnterpriseDTO)], this.enterpreiceCotroller.create);
        this.router.get('/enterprises', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.enterpreiceCotroller.getAll);
        this.router.get('/enterprises/:enterprise_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.enterpreiceCotroller.getOne);
        this.router.patch('/enterprises/:enterprise_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateEnterpriseDTO)], this.enterpreiceCotroller.update);
        this.router.delete('/enterprises/:enterprise_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.enterpreiceCotroller.delete);

        // * Relations
        this.router.post('/enterprises/preview_signature', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateEnterpriseDTO)], this.enterpreiceCotroller.priviewSignature)

        this.router.patch('/enterprises/:enterprise_id/signature', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateSignatureDto)], this.enterpreiceCotroller.updateSignature)

        this.router.get('/enterprises/:enterprise_id/signature', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.enterpreiceCotroller.getSignature)

        this.router.post('/enterprises/:enterprise_id/download_signature', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(NewSignatureDto)], this.enterpreiceCotroller.newSignature)
    }
}