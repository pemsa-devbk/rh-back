import express, {Application, Request, Response} from 'express'
import cors from 'cors'
import morgan from 'morgan'
import {join} from 'path'
import logger from '../config/logger';
import userRoutes from '../routes/users.route'
import movsRoutes from '../routes/movs.route'
import contactRoutes from '../routes/contact.route'
import authRoutes from '../routes/auth.route'
import seedRoutes from '../routes/seed.route'
import configRoutes from '../routes/config.route'
import { appDataSource } from '../db/dataBase';

export class Server {
    private app: Application;
    private port: number;

    //definir los paths, Rutas: 
    private paths = {
        users: '/users',
        movs: '/movs',
        contact:'/contact',
        auth: '/auth',
        seed: '/seed',
        config:'/config',
        // states:'/states',
        // rols: '/roles',
    }
    constructor () {
        this.port= 3000;
        this.app= express();

        this.middlewares();
        this.conectDataBase();
    }

    //se configuran los puertos middlewares:
    private middlewares (){
        this.app.use (cors()); //permite acceder a los recursos restringidos de un sitio desde otro dominio
        this.app.use (express.json());
        this.app.use (morgan('dev')); //permite el manejo de los loggers de las solicitudes de Entrada.
        //en caso de tener archivos estáticos, express los manejara
        const path = join(__dirname,'../../public');
        this.app.use (express.static(path));
    }

    private routes (){
        //this. porque vas a usar una propiedad
        this.app.use (this.paths.users, userRoutes);
        this.app.use (this.paths.config, configRoutes);
        // this.app.use (this.paths.states, statesOffi);
        
        this.app.use (this.paths.movs, movsRoutes);
        this.app.use (this.paths.contact, contactRoutes);
        this.app.use (this.paths.auth, authRoutes);
        this.app.use (this.paths.seed, seedRoutes);
        
    }


    private conectDataBase(intentConect: number = 3){
        
        appDataSource.initialize()
        .then(() =>{
            this.routes();
            this.handleErrors();
        })
        .catch((err) => {
            console.log(err);
            
            if(intentConect == 0){
                logger.error('Fallo en la conexión de la base de datos, aplicación terminada');
                throw 'Ha finalizado la aplicación';
            }
            setTimeout(() => {
                logger.warn('Fallo en la conexión de la base de datos, intentando nuevamente')
                this.conectDataBase(--intentConect)
            }, 3000);
        })
    }

    private handleErrors (){
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.app.use ((err:unknown, req:Request, res: Response,next: ()=> void) =>{
            res.json({
                error: `${err}`
            })
        })
    }


    listen (){
        this.app.listen(this.port, () => {
            logger.info(`Servidor corriendo en el puerto: ${this.port}`);
        })
    }
}
