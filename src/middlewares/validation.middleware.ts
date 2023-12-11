import { plainToInstance } from "class-transformer"
import { ValidationError, validateSync } from "class-validator";
import { Request, Response } from "express";


//uso de operadores ternarios.
export const validationMiddleware = <T extends object> (dtoClass: new() => T) => {
    //nos devuelve
    return (req: Request, res:Response, next: () => void) => {
        //pasamos el texto plano
        const data = plainToInstance (dtoClass, req.body);
        

        //crear const error para la validacion
        const errors = validateSync(data, {whitelist: true, forbidNonWhitelisted: true});

        //buscamos que el error sea más de 0
        if(errors.length > 0){
            return res.status(400).json({
                errors: getErrors(errors)[0]
            })
        }
        return next();
    }
}

const getErrors = (errors:ValidationError[],property?:string): string[] => {
    return errors.flatMap((error) =>{
        if(error.children?.length >0 ) return getErrors(error.children,`${property ? `${property}-` : ''}${error.property || ''}`)
        return `${property? `${property} `: ''}${Object.values(error.constraints)[0]}`
    })
}