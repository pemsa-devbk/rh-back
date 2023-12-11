import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { getRoles, getStates } from "../controllers/config.controller";


const router = Router();

router.get ('/states', [authentication, autorizationCheck([validRoles.admin, validRoles.manager])], getStates );

router.get('/roles', [authentication, autorizationCheck([validRoles.admin, validRoles.manager])], getRoles)

export default router;