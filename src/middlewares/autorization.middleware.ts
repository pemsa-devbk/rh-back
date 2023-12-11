import { Request, Response } from "express"

export const autorizationCheck = (roles: string[]) =>{
    //vamos a devolver una req,  res y next
    return (req: Request, res: Response, next: () => void ) => {
        //buscamos en la req de usuario que contenga el rol
        if(roles.includes(req.user.rol)){
            return next();
        }
        
        return res.status(401).json({
            error: `Este usuario: ${req.user.id} no tiene los permisos necesarios`
        })
    }
}