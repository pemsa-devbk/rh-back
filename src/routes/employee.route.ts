import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { CreateEmployeeDTO } from "../Dto/user/createEmployee.dto";
import { EmployeeController } from "../controllers/employee.controller";

export class EmployeeRoute{
    constructor(
        public router = Router(),
        private readonly controller = new EmployeeController
    ){
        this.initialize();
    }

    private initialize(){
        this.router.post('/employees', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateEmployeeDTO)], this.controller.create);
        this.router.get('/employees/:user_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getOne)
        this.router.delete('/employees/:user_id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.delete)
        this.router.patch('/employees', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(CreateEmployeeDTO)], this.controller.update)

        // * Rutas relacionadas (+1 nivel)
        this.router.get('/enterprises/:enterprise_id/employees', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getByEnterprise );
        this.router.get('/offices/:office_id/employees', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getByOffice )
        this.router.get('/departments/:department_id/employees', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getByDepartment)
        this.router.get('/areas/:area_id/employees', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getByArea)
        this.router.get('/positions/:position_id/employees', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getByPosition )
        this.router.get('/courses/:course_id/employees', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getByCourse)


        
        // * Rutas globales (sin contexto)
        this.router.get('/employees', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], this.controller.getAll )
    }
}