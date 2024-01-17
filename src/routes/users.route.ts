import { Router } from "express";
import { getErrors } from "../middlewares/validation.middleware";
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
import { validateSync } from "class-validator";
import { plainToInstance } from "class-transformer";





const router = Router();

//realizamos la configuración para la foto de los usuarios
const storage = multer.diskStorage({
    // destination: 'public/img',
    destination(req, file, callback) {
        
        const id = JSON.parse(req.body.data)?.id || req.params.id;
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
        callback(null, `${file.fieldname}.${extenArch}`)
    },
})


//validamos si el archivo iamgen existe:
const uploadAdd = multer({
    storage, fileFilter(req, file, callback) {

        // ? Descomentar
        const body = JSON.parse(req.body.data);
        const data = plainToInstance(CreateUserDto, body);
        const errors = validateSync(data, { whitelist: true });
        if (errors.length > 0) {
            return callback(new Error(getErrors(errors)[0]))
        }
        
        // TODO: Mas validaciones aquí
        if (!file.mimetype.includes('image')) {
            callback(new Error('Solo se admiten archivos de tipo imagen'))
        }
        if (!file.mimetype.includes('jpeg') && !file.mimetype.includes('png')) {
            callback(new Error('Error: Extensión de archivo incorrecto'))
        }
        callback(null, true)
    },
})

const uploadEdit = multer({
    storage, fileFilter(req, file, callback) {

        // ? Descomentar
        const body = JSON.parse(req.body.data);
        const data = plainToInstance(upDateUserDTO, body);
        const errors = validateSync(data, { whitelist: true });
        if (errors.length > 0) {
            return callback(new Error(getErrors(errors)[0]))
        }

        // TODO: Mas validaciones aquí
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
// upload.fields([{ name: 'img', maxCount: 1 }, { name: 'firma', maxCount: 1 }])

router.post('/', [authentication, uploadAdd.fields([{ name: 'img', maxCount: 1 }, { name: 'firma', maxCount: 1 }]), validArchivo, formdataMiddleware, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], createUser)
//router.post('/:id', [authentication, upload.single('imag'), validArchivo, autorizationCheck([validRoles.admin])], createImg)

router.get('/', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER, validRoles.QUERY])], getAllUsers)

router.get('/:id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.QUERY])], getOneUser)

router.patch('/edit/:id', [authentication, uploadEdit.fields([{ name: 'img', maxCount: 1 }, { name: 'firma', maxCount: 1 }]), validArchivo, formdataMiddleware, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], upDateUser)
router.patch('/reintegro/:id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_USER])], reactivatedUser)

router.get('/img/:id', photoUser)
router.get('/credencial/:id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.MANAGER, validRoles.SUPER_USER])], credencial)
router.get('/public/:id', publicUser)

router.delete('/:id', [authentication, autorizationCheck([validRoles.ADMIN, validRoles.SUPER_USER])], deleteUser)

export default router;