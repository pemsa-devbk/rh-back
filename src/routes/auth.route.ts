import { Router } from "express";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { AuthDTO } from "../Dto/auth/auth.dto";
import { authLogin, checkLogin } from "../controllers/auth.controller";
import { authentication } from "../middlewares/auth.middleware";


const router = Router();

router.post('/login', [validationMiddleware(AuthDTO)], authLogin)
router.get('/check', [authentication], checkLogin)

export default router;