import { DataSource } from "typeorm";
import { enviroment } from "../config/enviroment";
import { User } from "./entities/user.entity";
import { Mov } from "./entities/movs.entity";
import { Bitacora } from "./entities/bita.entity";
import { Contact } from "./entities/contact.entity";
import { State } from "./entities/state.entity";

export const appDataSource = new DataSource ({
    type:'mssql',
    host: enviroment.HOST,
    port: 1433, 
    username: enviroment.USERNAME,
    password: enviroment.PASSWORD,
    database: enviroment.DATABASE,
    synchronize: true, 
    // logging: true,
    entities: [User, Mov, Bitacora, Contact, State],
    extra: {
        trustServerCertificate:true
    }
})

