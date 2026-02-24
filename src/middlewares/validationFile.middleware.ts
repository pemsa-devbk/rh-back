import { Request, Response } from "express";
import multer from "multer";


export const validArchivo = (err:unknown, req: Request , res:Response, next: () => void)=>{
    if( err instanceof multer.MulterError){
        //devolvemos el error:
        return res.status(400).json({
            error: err.message
        })
    } else if(err){
        return res.status(400).json({
            //@ts-ignore
            error: err.message ? err.message :`${err}`
        })
    }
    
    next ()
}