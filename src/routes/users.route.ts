import { Router } from "express";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { CreateUserDto } from "../Dto/user/createUser.dto";
import { createUser, credencial, deleteUser, getAllUsers, getOneUser, photoUser, publicUser, reactivatedUser, upDateUser } from "../controllers/users.controller";
import { upDateUserDTO } from "../Dto/user/upDateUser.dto";
import { autorizationCheck } from "../middlewares/autorization.middleware";
import { validRoles } from "../types/enums/roles";
import { authentication } from "../middlewares/auth.middleware";
import multer from 'multer';
import { validArchivo } from "../middlewares/validationFile.middleware";
import { formdataMiddleware } from "../middlewares/formdata.middleware";
import { join } from 'path'
import {existsSync, mkdirSync} from 'fs'





const router = Router();

//realizamos la configuración para la foto de los usuarios
const storage = multer.diskStorage({
    // destination: 'public/img',
    destination(req, file, callback) {
        const { id } = JSON.parse(req.body.data);
        const pathFile = join(__dirname, "..", "..", "docs", id);
        if(!existsSync(pathFile))mkdirSync(pathFile);

        callback(null,`${pathFile}`)
    },
    filename(req, file, callback) {
        //asignamos el nombre a nuestro archivo

        const validaExten = file.originalname.split('.');

        if (validaExten.length < 2) {
            callback(new Error('El archivo no es válido'), null)
        }
        const extenArch = validaExten.pop();
        callback(null, `img.${extenArch}`)
    },
})

//validamos si el archivo iamgen existe:
const upload = multer({
    storage, fileFilter(req, file, callback) {
        if (!file.mimetype.includes('image')) {
            callback(new Error('Solo se admiten archivos de tipo imagen'))
        }

        if (!file.mimetype.includes('jpeg') && !file.mimetype.includes('png')) {
            callback(new Error('Error: Extensión de archivo incorrecto'))
        }
        callback(null, true)
    },
})

// revisar el patch
// agragr los roles a las rutas faltantes


router.post('/', [authentication, upload.single('imag'), validArchivo, formdataMiddleware, validationMiddleware(CreateUserDto), autorizationCheck([validRoles.admin, validRoles.manager])], createUser)
//router.post('/:id', [authentication, upload.single('imag'), validArchivo, autorizationCheck([validRoles.admin])], createImg)

router.get('/', [authentication, autorizationCheck([validRoles.admin, validRoles.consultas])], getAllUsers)

router.get('/:id', [authentication, autorizationCheck([validRoles.admin, validRoles.consultas])], getOneUser)

router.patch('/edit/:id', [authentication, upload.single('imag'), validArchivo, formdataMiddleware, validationMiddleware(upDateUserDTO), autorizationCheck([validRoles.admin, validRoles.manager])], upDateUser)
router.patch('/reintegro/:id', [authentication], reactivatedUser)

router.get('/img/:id', photoUser)
router.get('/credencial/:id', [authentication, autorizationCheck([validRoles.admin, validRoles.consultas])], credencial)
router.get('/user-public/:id', publicUser)

router.delete('/:id', [authentication, autorizationCheck([validRoles.admin])], deleteUser)

export default router;