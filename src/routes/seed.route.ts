import { Router } from "express";
import { SeedController } from "../controllers/seed.controller";

export class SeedRoute{
    constructor(
        public router = Router(),
        private readonly controller = new SeedController()
    ){
        this.initialize();
    }

    private initialize(){
        this.router.get('/seed/departments', this.controller.loadDepartments);
        this.router.get('/seed/areas', this.controller.loadAreas);
        this.router.get('/seed/positions', this.controller.loadPositions);
        this.router.get('/seed/users', this.controller.loadUsers);
        this.router.get('/seed/copy-files', this.controller.copyFiles);
    }
}
