import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { FileController } from "../controllers/file.controller";
import { validationMiddleware, validationQuery } from "../middlewares/validation.middleware";
import { SearchFile } from "../Dto/file/SearchFile.dto";
import { CreateFileDTO } from "../Dto/file/createFile.dto";
import { UpdateFileDTO } from "../Dto/file/updateFile.dto";
import { UploadFileDTO } from "../Dto/file/uploadFile.dto";

export class FileRoute {

    constructor(
        public router = Router(),
        private readonly controller = new FileController()
    ) {
        this.initialize();
    }

    private initialize() {
        this.router.post('/files', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN]), validationMiddleware(CreateFileDTO)], this.controller.create);
        this.router.get('/files', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN]), validationQuery(SearchFile)], this.controller.getAll);
        this.router.patch('/files/:file_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN]), validationMiddleware(UpdateFileDTO)], this.controller.update);
        this.router.delete('/files/:file_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.controller.delete);
        this.router.patch('/files/:file_id/status', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.controller.changeStatus);

        // * rutas relacionada
        this.router.get('/employees/:employee_id/files', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.controller.getByEmployee);
        this.router.post('/employees/:employee_id/files', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN]), validationMiddleware(UploadFileDTO)], this.controller.uploadForUser);
        this.router.get('/employees/:employee_id/files/:file_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.controller.getFileEmployee);
        // * Otros archivos
        this.router.get('/employees/:employee_id/credential', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.controller.getCredential);
        this.router.get('/employees/:employee_id/signature', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.controller.getSignature);
        this.router.patch('/employees/:employee_id/signature', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_ADMIN])], this.controller.refreshSignature);
        // * Public 
        this.router.get('/employees/:employee_id/profile', this.controller.getPhotoEmployee);

    }
}
