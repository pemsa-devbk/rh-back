import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { CreateDepartmentDto } from "../Dto/department/createDepartment.dto";
import { UpdateDepartmentDto } from "../Dto/department/updateDepartment.dto";
import { DepartmentController } from "../controllers/department.controller";


export class DepartmentRoute {
    constructor(
        public router = Router(),
        private controller = new DepartmentController()
    ) {
        this.initialize();
    }

    private initialize() {
        this.router.post(`/offices/:office_id/departments`, [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateDepartmentDto)], this.controller.create);
        this.router.get(`/offices/:office_id/departments/:department_id`, [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.controller.getOne);
        this.router.delete(`/offices/:office_id/departments/:department_id`, [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.delete);
        this.router.patch(`/offices/:office_id/departments/:department_id`, [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateDepartmentDto)], this.controller.update);
        this.router.get(`/offices/:office_id/departments/departments`, [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.controller.getByOffice);

        // * Rutas relacionadas (+1 nivel)
        this.router.get('/enterprises/:enterprise_id/departments', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.controller.getByEnterprise)

        // * Rutas globales
        this.router.get('/departments', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], this.controller.getAll)
    }
}