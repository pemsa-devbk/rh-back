import { Router } from "express";
import { seedUser } from "../controllers/seed.controller";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { CreateSeedDto } from "../Dto/user/seedCreate.dto";

//Se crea un semillero. Esta ruta se ejecutará una única vez
//Sirve para crear el Admin y nada más.

const router = Router();

//creamos la ruta de tipo post
//[crear y usar la validacion de middleware para crear el usuario]
//(esto es el DTO para crearUser que pasa como parametro del middleware),
//añadimos el controlador que maneja la creacion del user
router.post ('/', [validationMiddleware(CreateSeedDto)], seedUser)

export default router;
