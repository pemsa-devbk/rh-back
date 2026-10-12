import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { CreateEmployeeDTO } from "../Dto/user/createEmployee.dto";
import { EmployeeController } from "../controllers/employee.controller";
import { UpdateEmployeeDTO, UpdatePasswordDTO } from "../Dto/user/updateEmployee.dto";

export class EmployeeRoute{
    constructor(
        public router = Router(),
        private readonly controller = new EmployeeController
    ){
        this.initialize();
    }

    private initialize(){
        // * Rutas personales del usuario logueado
        this.router.put('/employees/me/password', [authentication, autorizationCheck([validRoles.EMPLOYEE, validRoles.ADMIN]), validationMiddleware(UpdatePasswordDTO)], this.controller.changePassword)
        this.router.get('/me', [authentication, autorizationCheck([validRoles.EMPLOYEE, validRoles.ADMIN])], this.controller.myInfo)

        this.router.post('/employees', [authentication, autorizationCheck([validRoles.SUPER_ADMIN, validRoles.ADMIN]), validationMiddleware(CreateEmployeeDTO)], this.controller.create);
        this.router.get('/employees/:employee_id', [authentication, autorizationCheck([validRoles.SUPER_ADMIN, validRoles.ADMIN])], this.controller.getOne)
        this.router.delete('/employees/:employee_id', [authentication, autorizationCheck([validRoles.SUPER_ADMIN, validRoles.ADMIN])], this.controller.delete)
        this.router.patch('/employees/:employee_id', [authentication, autorizationCheck([validRoles.SUPER_ADMIN, validRoles.ADMIN]), validationMiddleware(UpdateEmployeeDTO)], this.controller.update)
        // TODO falta implementar
        // this.router.post('/employees/:user_id/password-reset', [authentication, autorizationCheck([validRoles.SUPER_ADMIN, validRoles.ADMIN])], this.controller.passwordReset)
        this.router.post('/employees/:user_id/toggle-status', [authentication, autorizationCheck([validRoles.SUPER_ADMIN, validRoles.ADMIN])], this.controller.toggleStatus);

        // * Rutas relacionadas (+1 nivel)
        this.router.get('/enterprises/:enterprise_id/employees', [authentication, autorizationCheck([validRoles.SUPER_ADMIN, validRoles.ADMIN])], this.controller.getByEnterprise );
        this.router.get('/offices/:office_id/employees', [authentication, autorizationCheck([validRoles.SUPER_ADMIN, validRoles.ADMIN])], this.controller.getByOffice )
        this.router.get('/departments/:department_id/employees', [authentication, autorizationCheck([validRoles.SUPER_ADMIN, validRoles.ADMIN])], this.controller.getByDepartment)
        this.router.get('/areas/:area_id/employees', [authentication, autorizationCheck([validRoles.SUPER_ADMIN, validRoles.ADMIN])], this.controller.getByArea)
        this.router.get('/positions/:position_id/employees', [authentication, autorizationCheck([validRoles.SUPER_ADMIN, validRoles.ADMIN])], this.controller.getByPosition )
        this.router.get('/courses/:course_id/employees', [authentication, autorizationCheck([validRoles.SUPER_ADMIN, validRoles.ADMIN])], this.controller.getByCourse)


        
        // * Rutas globales (sin contexto)
        this.router.get('/employees', [authentication, autorizationCheck([validRoles.SUPER_ADMIN, validRoles.ADMIN])], this.controller.getAll )
        this.router.get('/public/employees/:employee_id', this.controller.getPublic)

    }
}