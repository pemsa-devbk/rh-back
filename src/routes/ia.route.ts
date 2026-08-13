import { Router } from "express";
import { IAController } from "../controllers/ia.controller";

// TODO No se utiliza
export class IARoute {
    constructor(
        public router = Router(),
        private readonly iaController = new IAController()
    ){
        this.initialize();
    }

    private initialize(){
        this.router.post('ia/nanobanana-image-callback', this.iaController.callbackNanobanana)
        this.router.get('ia/nanobanana/image/:id', )
        this.router.post('ia/nanobanana/:id', )
    }
}