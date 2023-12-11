//Variables de entorno- son vas variables que van dentro dl arch _dataBase.ts_
import dotenv from 'dotenv'

dotenv.config();
export const enviroment = {
    PORT: process.env.PORT || '',
    HOST: process.env.HOST,
    USERNAME: process.env.DB_USERNAME,
    PASSWORD: process.env.PASSWORD,
    DATABASE: process.env.DATABASE,
    API_PATH: process.env.API_PATH
}