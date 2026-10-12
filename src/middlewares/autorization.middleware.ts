import { Request, Response } from "express"

export const autorizationCheck = (roles: number[]) =>{
    //vamos a devolver una req,  res y next
    return (req: Request, res: Response, next: () => void ) => {
        //buscamos en la req de usuario que contenga el rol
        if(roles.includes(req.user.role_id)){
            return next();
        }
        
        return res.status(403).json({
            error: `Este usuario: ${req.user.user_id} no tiene los permisos necesarios`
        })
    }
}