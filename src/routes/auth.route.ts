import { Router } from "express";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { AuthDTO } from "../Dto/auth/auth.dto";
import { AuthController } from "../controllers/auth.controller";
import { authentication } from "../middlewares/auth.middleware";


export class AuthRoute {

    constructor(
        public router = Router(),
        private readonly controller = new AuthController()
    ) {
        this.initialize();
    }

    private initialize() {
        this.router.post('/auth/login', [validationMiddleware(AuthDTO)], this.controller.login)
        this.router.get('/auth/check', [authentication], this.controller.check)
        this.router.post('/auth/refresh', this.controller.refresh)
    }
}
