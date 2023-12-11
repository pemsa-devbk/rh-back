import passport from "passport";
import {Strategy as JwtStragy, ExtractJwt, StrategyOptions  } from 'passport-jwt'
import { appDataSource } from "../db/dataBase";
import { User } from "../db/entities/user.entity";
import {readFileSync} from 'fs'
import {join} from 'path'
import { Request, Response } from "express";




const jwtOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

    //aqui pondremos la secretKey
     secretOrKey: readFileSync(join(__dirname,'../', '/certs', 'public.pem'))

}

interface Payload {
    id: string;
}

passport.use( new JwtStragy (jwtOptions, async (payload: Payload, done) => {
    //creamos repository
    const userRepository = appDataSource.getRepository(User);

    //buscamos por id, para más inof revisar documentación 
    const user = await userRepository.findOne({where: {id: payload.id}})

    if(!user){
        return done ('Usuario no existente', null)
    }
    //.status !=ValidStateMov.alta esta info va dentro de nuestra condicional
    if(!user.status){
        return done ('El estado del usuario es inactivo', null)
    }
    
    return done(null, user)
}))

//AGREGAR LA AUTENTICACIÓN
export const  authentication = (req: Request, res: Response, next: () => void) =>{
    passport.authenticate('jwt', {session:false}, (er: unknown, user: User, info: unknown) => {
        if(er){
            return res.status(401).json({
                error: er
            })
        }
        if(info){
            return res.status(401).json({
                error: `${info}`
            })
        }
        req.user = user;
        return next()
    })(req, res, next)
}

export default passport;