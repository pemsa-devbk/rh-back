import { Request, Response } from "express";

export const formdataMiddleware = (req: Request, res: Response, next: () => void) => {

        
        req.body = JSON.parse(req.body.data);
        
        
        
    
    
       return next();
    }


