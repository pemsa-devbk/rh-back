import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { EnterpriceController } from "../controllers/enterprice.controller";
import multer from "multer";
import { validArchivo } from "../middlewares/validationFile.middleware";
import { CreateEnterpriseDTO } from "../Dto/enterprise/createEnterprise.dto";
import { UpdateEnterpriseDTO } from "../Dto/enterprise/updateEnterprise.dto";
import { CreateSignatureDto } from "../Dto/enterprise/createSignature.dto";
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
// TODO: Revisar firma (forma de acceso)
function isImage(mimetype: string) {
    return mimetype.startsWith('image/');
}

export class EnterpriseRoute {

    private upload = multer({
        storage: multer.memoryStorage(),
        fileFilter(req, file, callback) {
            if (!isImage(file.mimetype)) {
                return callback(new Error(`El campo "${file.fieldname}" debe ser una imagen.`));
            }
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024 // Máx 5MB
        }
    });

    constructor(
        public router = Router(),
        private readonly enterpreiceCotroller = new EnterpriceController()
    ) {
        this.initialize();
    }

    private initialize() {
        this.router.post('/enterprises', [authentication,this.upload.single('logo'), validArchivo, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateEnterpriseDTO)], this.enterpreiceCotroller.create);
        this.router.get('/enterprises', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.enterpreiceCotroller.getAll);
        this.router.get('/enterprises/:enterprise_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.enterpreiceCotroller.getOne);
        this.router.patch('/enterprises/:enterprise_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateEnterpriseDTO)], this.enterpreiceCotroller.update);
        this.router.delete('/enterprises/:enterprise_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.enterpreiceCotroller.delete);

        // * Relations
        this.router.post('/enterprise/:enterprise_id/preview_signature', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateSignatureDto)], this.enterpreiceCotroller.priviewSignature)
        this.router.post('/enterprise/:enterprise_id/create_signature', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateSignatureDto)], this.enterpreiceCotroller.createSignature)

        this.router.patch('/signature/:id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateSignatureDto)], this.enterpreiceCotroller.updateSignature)
        this.router.get('/signature/:id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.enterpreiceCotroller.getSignature)
        this.router.post('/enterprise/:id/download_signature', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(NewSignatureDto)], this.enterpreiceCotroller.newSignature)
    }
}