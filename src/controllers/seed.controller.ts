import { Request, Response } from "express";
import { CreateUserDto } from "../Dto/user/createUser.dto";
import { plainToInstance } from "class-transformer";
import { appDataSource } from "../db/dataBase";
import { User } from "../db/entities/user.entity";
import bcrypt from 'bcrypt'
import { State } from "../db/entities/state.entity";
import { validRoles } from "../types/enums/roles";
import { Mov } from "../db/entities/movs.entity";
import { ValidStateMov } from "../types/enums/validMov";


export const seedUser = async (req: Request, res: Response) => {
    // lógica de negocio (ie, todo lo que hace mi función)
    //se pasa a text plano y sacamos el password de la function de seedUser
    const { password, ...seedUser } = plainToInstance(CreateUserDto, req.body);
    //Se crea el repositorio!!
    const userRepository = appDataSource.getRepository(User);
    const stateRepository = appDataSource.getRepository(State);
    const movsRepository = appDataSource.getRepository(Mov);

    //Se verifica si el usuario existe! con el repositorio
    const userFind = await userRepository.find();

    //Se crea condicional para la busqueda
    if (userFind.length > 0) {
        //return next(`Ya existe al menos un usuario en la base de datos`) next: (er: string) => void
        return res.status(401).json({
            error: `Ya existe al menos un usuario en la base de datos`
        })
    }

    //iniciamos la transacción
    const queryRunner = appDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
        const statesToCreated = ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Distrito Federal', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'].map((state, idx) => {
            return stateRepository.create({ name: state, id: idx + 1 });
        });
        await queryRunner.manager.save(statesToCreated);

        const movsToCreated = Object.entries(ValidStateMov).slice(Object.entries(ValidStateMov).length / 2).map(([key, value]) => {
            return movsRepository.create({ nameMov: key, id: +value })
        })
        await queryRunner.manager.save(movsToCreated);

        ////En caso de no encontrar un usuario entonces se crea el usuario:
        const user = userRepository.create({
            ...seedUser,
            region: {
                id: seedUser.idState
            },
            //instalar el bcrypt y sus types para poder encriptar el password:
            password: bcrypt.hashSync(password, 10),
            //añadir el archivo de los roles para el manejo de ellos
            rol: validRoles.ADMIN
        })
        await queryRunner.manager.save(user)

        // Se crean todos los estado en la DB
        await queryRunner.commitTransaction();

        delete user.password;
        res.json({
            user
        })

    } catch (error) {
        await queryRunner.rollbackTransaction()
        throw error;

    } finally {
        await queryRunner.release()
    }


}