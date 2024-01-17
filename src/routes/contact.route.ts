import { Router } from "express";
import { createContact, deleteContact, getAllContact, getOneContact, upDateContact } from "../controllers/contact.controller";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { CreateContactDTO } from "../Dto/contact/createContact.dto";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { authentication } from "../middlewares/auth.middleware";

const router = Router();

// Post
/**
 * id params el id del usuario al que se le va a agregar el contacto
 * body contact
 */

router.post('/:id',[authentication, validationMiddleware(CreateContactDTO), autorizationCheck([validRoles.ADMIN, validRoles.MANAGER])], createContact)


router.get('/', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER])],getAllContact)


router.get('/:id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER])],getOneContact)


/**
 * id params del contacto a editar
 * body datos a actualizar
 */
router.patch('/edit/:id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER])],upDateContact)

/**
 * id params del contacto a eliminar 
 */
router.delete('/:id', [authentication, autorizationCheck([validRoles.ADMIN])], deleteContact)

export default router;