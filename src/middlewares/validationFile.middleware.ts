import { Request, Response } from "express";
import multer from "multer";


export const validArchivo = (err:unknown, req: Request , res:Response, next: () => void)=>{
    if( err instanceof multer.MulterError){
        //devolvemos el error:
        return res.status(401).json({
            error: err.message
        })
    } else if(err){
        return res.json({
            error: `${err}`
        })
    }
    next ()
}