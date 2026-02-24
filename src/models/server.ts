import express, { Application, NextFunction, Request, Response } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { join } from 'path'
import logger from '../config/logger';
import { ContactRoute } from '../routes/contact.route'
import authRoutes from '../routes/auth.route'
import seedRoutes from '../routes/seed.route'
import { FileRoute } from '../routes/file.route'
import { HolidayRoute } from '../routes/holidays.route'
import { BinnacleRoute } from '../routes/binnacle.route';
import { appDataSource } from '../db/dataBase';
import { TaskService } from '../services/task.service';
import { AreaRoute } from '../routes/area.route';
import { PositionRoute } from '../routes/position.route';
import { OfficeRoute } from '../routes/office.route';
import { UserRoute } from '../routes/users.route';
import { ConfigRoute } from '../routes/config.route';
import { EnterpriseRoute } from '../routes/enterprise.route';
import { BirthdayService } from '../services/birthday.service';
import { UserService } from '../services/user.service';
import { Not } from 'typeorm';
import { CourseRoute } from '../routes/course.route';
import { StateRoute } from '../routes/state.route';
import { MunicipalityRoute } from '../routes/municipality.route';
import { ColonyRoute } from '../routes/colony.route';

export class Server {
    private app: Application;
    private port: number;

    //definir los paths, Rutas: 
    private paths = {
        auth: '/auth',
        seed: '/seed',
    }
    constructor() {
        this.port = 3000;
        this.app = express();

        this.middlewares();
        this.conectDataBase();
    }

    //se configuran los puertos middlewares:
    private middlewares() {
        this.app.use(cors()); //permite acceder a los recursos restringidos de un sitio desde otro dominio
        this.app.use(express.json());
        this.app.use(morgan('dev')); //permite el manejo de los loggers de las solicitudes de Entrada.
        //en caso de tener archivos estáticos, express los manejara
        const path = join(__dirname, '../../public');
        this.app.use(express.static(path));
    }

    private routes() {
        //this. porque vas a usar una propiedad

        this.app.use(this.paths.auth, authRoutes);
        this.app.use(this.paths.seed, seedRoutes);

        // * Nueva forma
        const fileRoute = new FileRoute();
        this.app.use(fileRoute.router);
        const contactRoute = new ContactRoute();
        this.app.use(contactRoute.router);
        const userRoute = new UserRoute();
        this.app.use(userRoute.router);
        const areaRoute = new AreaRoute();
        this.app.use(areaRoute.router);
        const positionRoute = new PositionRoute();
        this.app.use(positionRoute.router);
        const officeRouter = new OfficeRoute();
        this.app.use(officeRouter.router);
        const binnacleRouter = new BinnacleRoute();
        this.app.use(binnacleRouter.router);
        const holidayRouter = new HolidayRoute();
        this.app.use(holidayRouter.router);
        const configRouter = new ConfigRoute();
        this.app.use(configRouter.router);
        const enterpriseRouter = new EnterpriseRoute();
        this.app.use(enterpriseRouter.router);
        const courseRouter = new CourseRoute();
        this.app.use(courseRouter.router);
        const stateRouter = new StateRoute();
        this.app.use(stateRouter.router);
        const municipalityRoute = new MunicipalityRoute();
        this.app.use(municipalityRoute.router);
        const colonyRoute = new ColonyRoute();
        this.app.use(colonyRoute.router);

        // TODO: Revisar hasta tener datos
        this.app.use('/bitrhDay', async (req, res) => {
            const bb = new BirthdayService();
            const userService = new UserService();
            const users = await userService.userRepository.find({ relations: { position: true }, where: { rol: Not('super-user') } });
            console.log(users);

            const rp = bb.template_2([...users, ...users]);


            res.setHeader("Content-Type", "application/pdf");
            res.setHeader('Content-Disposition', `inline; filename=doc.pdf`);
            res.send(Buffer.from(rp))
        })

    }




    private conectDataBase(intentConect: number = 3) {
        appDataSource.initialize()
            .then(() => {
                this.routes();
                this.handleErrors();
                this.tasks();
            })
            .catch((err) => {
                if (intentConect == 0) {
                    logger.error('Fallo en la conexión de la base de datos, aplicación terminada');
                    throw 'Ha finalizado la aplicación';
                }
                setTimeout(() => {
                    logger.warn(`Fallo en la conexión de la base de datos, intentando nuevamente. Error: ${err}`)
                    this.conectDataBase(--intentConect)
                }, 3000);
            })
    }

    private handleErrors() {
        this.app.use((err: any, _: Request, res: Response, next: NextFunction) => {
            console.log(err);
            res.status(500).json({
                error: `${err}`
            })
        })
    }

    private async tasks() {

        const task = new TaskService();
        // await task.checkBirthdayUsers();
        // await task.checkContractAnniversaries();
        // await task.checkVacations();
        task.StartTask();
    }


    listen() {
        this.app.listen(this.port, () => {
            logger.info(`Servidor corriendo en el puerto: ${this.port}`);
        })
    }
}
