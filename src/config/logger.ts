//nos permite hacer logger de consola y de arch
//Logger de arch, nos devuelve todos los logs

import winston from "winston";

const consoleFormat = winston.format.combine(

    winston.format.timestamp({
        format: new Date().toLocaleString()
    }),
    winston.format.colorize(),
    winston.format.printf((info) => {
        return `${info.timestamp} [${info.level}]: ${info.message}`
    })
)

const fileFormat = winston.format.combine(
    winston.format.timestamp({
        format: new Date().toLocaleString()
    }),
    winston.format.printf((info) => {
        return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
    })
)

//aQUÍ SE CONIGURA EL LOGGER PARA QUE TOME EL NIVEL DE INFO 
//solo se ocupa en todo menos http
const logger = winston.createLogger({
    //En level info solo toma en cuenta los que están debajo de el
    //para más niveles recuerda revisar documentación de winston
    transports: [
        new winston.transports.Console({
            level:'info',
            format: consoleFormat
        }),
        new winston.transports.File({
            level: 'info',
            filename: 'combined.log',
            format: fileFormat
        })
    ]
})

export default logger;