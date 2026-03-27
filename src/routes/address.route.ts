import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { AddressDTO, UpdateAddressDTO } from "../Dto/user/complements/address.dto";
import { AddressController } from "../controllers/address.controller";


export class AddressRoute{
    constructor(
        public router = Router(),
        private readonly controller = new AddressController()
    ){
        this.initialize();
    }

    private initialize(){
        // TODO Validar el metodo post
        this.router.post('/employees/:employee_id/address', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(AddressDTO)], this.controller.create )
        this.router.patch('/employees/:employee_id/address', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(UpdateAddressDTO)], this.controller.update)
        this.router.get('/employees/:employee_id/address', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]) ], this.controller.getOne );
    }
}