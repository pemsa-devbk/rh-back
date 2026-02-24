import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { ConfigController } from "../controllers/config.controller";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { AssignUserDto } from "../Dto/config/assignUser.dto";
import { CreateConfigDto } from "../Dto/holidays/create_config.dto";
import { UpdateConfigDto } from "../Dto/holidays/update_config.dto";

export class ConfigRoute {
    constructor(
        public router = Router(),
        private readonly configController = new ConfigController(),
    ){
        this.initialize();
    }

    private initialize(){
        this.router.get('/configuration/special-users', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.configController.getConfiguration);
        this.router.patch('/configuration/update-user', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(AssignUserDto)], this.configController.assignUser);
        this.router.get('/configuration/roles', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.configController.getRoles);

        this.router.get('/configuration/holiday', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.configController.getConfigHoliday);
        this.router.post('/configuration/holiday', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateConfigDto)], this.configController.createConfigHoliday);
        this.router.patch('/configuration/holiday/:id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateConfigDto)], this.configController.updateConfig);
        this.router.delete('/configuration/holiday/:id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.configController.deleteConfig);

    }
}