import { Router } from "express";
import multer from "multer";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { FileController } from "../controllers/file.controller";
import { validArchivo } from "../middlewares/validationFile.middleware";

export class FileRoute {
    private upload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 5 * 1024 * 1024 // Máx 5MB
        }
    });
    constructor(
        public router = Router(),
        private readonly fileController = new FileController()
    ) {
        this.initialize();
    }

    private initialize() {

        this.router.get('/files/docs/*', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.fileController.listDirecoty);

        this.router.get('/files/download/*', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.fileController.donwload);

        this.router.post('/files/upload/*', [authentication, this.upload.array('documents'), validArchivo, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.fileController.uploadFiles);

        this.router.post('/files/rename', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.fileController.rename);

        this.router.delete('/files/docs/*', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.fileController.delete);

        this.router.post('/files/create', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.fileController.create);
    }
}
