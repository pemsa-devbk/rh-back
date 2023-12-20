import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { AuthDTO } from "../Dto/auth/auth.dto";
import { appDataSource } from "../db/dataBase";
import { User } from "../db/entities/user.entity";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {readFileSync} from 'fs'
import {join} from 'path'

export const authLogin = async (req: Request, res: Response) => {
    //logica de negocio: pasamos a txto plano  
    const login = plainToInstance(AuthDTO, req.body);
    const userRepository = appDataSource.getRepository(User);

    const user = await userRepository.findOne({ 
        where: {id: login.id}, 
        select:{
            id: true,
            name: true,
            rol: true,
            password: true,
            createdAt: true,
            //se agregaron los sig...
            birthdate:true,
            urlPhoto:true,
            status:true,
            upDateAt:true,
            deletedAt:true,
            
        },
        relations: {
            state: true
        }
    });
    
    if(user && bcrypt.compareSync(login.password, user.password)){
        delete user.password;
        const {state, ...userInfo} = user;
        return res.json({
            user: {
                ...userInfo,
                state: state.name
            },
            token: generateToken(user.id)
        })
    }
    res.status(401).json ({
        error: 'Credenciales invalidas'
    })
}


export const checkLogin = (req: Request, res: Response) => {
    res.json({
        user: {
            ...req.user,
        },
        token: generateToken(req.user.id)
    })
}


const generateToken = (id: string) =>{
    //generamos el token que nos sirve para acceder a nuestro sitio como admin n.n
    const path = join( __dirname, '../', '/certs', 'private.pem')
    return jwt.sign({id}, readFileSync(path), {algorithm:'RS256', expiresIn: '12h'});
}
