import { Router } from "express";
import multer from "multer";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { FileController } from "../controllers/file.controller";
import { validArchivo } from "../middlewares/validationFile.middleware";
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
        this.router.post('/files', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateFileDTO)], this.controller.create);
        this.router.get('/files', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationQuery(SearchFile)], this.controller.getAll);
        this.router.patch('/files/:file_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateFileDTO)], this.controller.update);
        this.router.delete('/files/:file_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.delete);
        this.router.patch('/files/:file_id/status', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.changeStatus);

        // * rutas relacionada
        this.router.post('/files/:file_id/employees/:employee_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UploadFileDTO)], this.controller.uploadForUser);
        this.router.get('/files/:file_id/employees/:employee_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getFileUser);
        // * New Routes

        // this.router.get('/files/docs/*', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.fileController.listDirecoty);

        // this.router.get('/files/download/*', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.fileController.donwload);

        // this.router.post('/files/upload/*', [authentication, this.upload.array('documents'), validArchivo, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.fileController.uploadFiles);

        // this.router.post('/files/rename', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.fileController.rename);

        // this.router.delete('/files/docs/*', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.fileController.delete);

        // this.router.post('/files/create', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.fileController.create);
    }
}
