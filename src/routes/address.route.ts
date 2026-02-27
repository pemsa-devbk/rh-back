import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { AddressDTO } from "../Dto/user/complements/address.dto";


export class AddressRoute{
    constructor(
        public router = Router()
    ){
        this.initialize();
    }

    private initialize(){
        // TODO Validar el metodo post
        this.router.post('employees/:user_id/adress', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(AddressDTO)],)
        this.router.patch('employees/:user_id/adress', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(AddressDTO)], )
        this.router.get('employees/:user_id/adress', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER]), validationMiddleware(AddressDTO)], )
    }
}