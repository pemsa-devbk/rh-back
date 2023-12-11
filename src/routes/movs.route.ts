import { Router, Request, Response } from "express";
import { createMov, deleteMov, getAllMovs, getOneMovs, upDateMov } from "../controllers/movs.controller";
import { plainToInstance } from "class-transformer";
import { CreateMovDto } from "../Dto/mov/createMov.dto";
import { validate } from "class-validator";
import { authentication } from "../middlewares/auth.middleware";

const router = Router();

//creamos la validacion del movimiento, verifica si hay movimientos creados
const validaMovimiento = async (req: Request, res: Response, next: () => void) => {
    const data = plainToInstance(CreateMovDto, req.body);
    const errors = await validate(data);
    if(errors.length > 0) { //error es > a 0 errorres entonces... 
        return res.status(400).json({
            error: errors
        })
    }
    return next();
} 


router.post('/', [authentication, validaMovimiento], createMov)

router.get('/', [authentication],getAllMovs)

router.get('/:id', [authentication],getOneMovs)

router.patch('/:id', [authentication, validaMovimiento], upDateMov)

router.delete('/:id', [authentication], deleteMov)

export default router;