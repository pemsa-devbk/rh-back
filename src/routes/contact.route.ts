import { Router } from "express";
import { ContactController } from "../controllers/contact.controller";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { authentication } from "../middlewares/auth.middleware";
import { UpDateContactDTO } from "../Dto/contact/upDateContact.dto";
import { CreateContactDTO } from "../Dto/contact/createContact.dto";

// * Rutas 
/**
 * crear contacto
 * obtener contactos por usuario
 * editar contacto
 * eliminar contacto
 */
export class ContactRoute {
    constructor(
        public router = Router(),
        private readonly contactController = new ContactController()
    ) { 
        this.initialize();
    }

    private initialize() {
        this.router.post('/users/:user_id/contacts', [authentication, validationMiddleware(CreateContactDTO), autorizationCheck([validRoles.SUPER_USER, validRoles.ADMIN, validRoles.MANAGER])], this.contactController.create);
        this.router.get('/users/:user_id/contacts', [authentication, autorizationCheck([validRoles.SUPER_USER, validRoles.ADMIN, validRoles.MANAGER])], this.contactController.getByUser)
        this.router.patch('/users/:user_id/contacts/:contact_id', [authentication, validationMiddleware(UpDateContactDTO), autorizationCheck([validRoles.SUPER_USER, validRoles.ADMIN, validRoles.MANAGER])], this.contactController.update)
        this.router.delete('/users/:user_id/contacts/:contact_id', [authentication, autorizationCheck([validRoles.SUPER_USER, validRoles.ADMIN])], this.contactController.delete)
    }
}