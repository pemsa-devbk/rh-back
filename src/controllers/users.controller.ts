import bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Request, Response } from "express";
import { CreateUserDto } from '../Dto/user/createUser.dto';
import { upDateUserDTO } from '../Dto/user/upDateUser.dto';
import { enviroment } from '../config/enviroment';
import { appDataSource } from '../db/dataBase';
import { Bitacora } from '../db/entities/bita.entity';
import { Contact } from "../db/entities/contact.entity";
import { User } from '../db/entities/user.entity';
import { ValidStateMov } from "../types/enums/validMov";


export const createUser = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.json({
            error: `error al no subir archivo`
        })
    }
    //saca password del usuario a crear
    const { password, contacts, ...userToCreate } = plainToInstance(CreateUserDto, req.body);
    const userRepository = appDataSource.getRepository(User);
    const contactRepository = appDataSource.getRepository(Contact);
    const bitacoraReposirtory = appDataSource.getRepository(Bitacora);

    //validar que el id ya existe
    const existUser = await userRepository.exist({ where: { id: userToCreate.id } })
    if (existUser) {
        return res.status(400).json({
            error: `${userToCreate.id} Ya existe un usuario con este id`
        })
    }
    const queryRunner = appDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
        // del uausario a crear debemos 
        const user = userRepository.create({
            ...userToCreate,
            password: bcrypt.hashSync(password, 10),
            urlPhoto: enviroment.API_PATH + '/' + req.file.filename
        });
        await queryRunner.manager.save(user)

        const bita = bitacoraReposirtory.create({
            userModificado: user,
            createdBy: req.user,
            movType: {
                id: ValidStateMov.alta
            }
        });
        await queryRunner.manager.save(bita)

        const contactAgree = contacts.map(contact => {

            return contactRepository.create({
                ...contact,
                user
            })
        });
        await queryRunner.manager.save(contactAgree)

        await queryRunner.commitTransaction()
        delete user.password;
        res.json({
            user
        })

    } catch (error) {
        await queryRunner.rollbackTransaction()
        res.status(500).json({
            msj: `${error}` //concatenar coment a texto
        })
    } finally {
        await queryRunner.release()
    }
}



export const getAllUsers = async (req: Request, res: Response) => {

    //lógica de negocio: 
    //crear el repository para obtener todos los usuarios:
    const userRepository = appDataSource.getRepository(User);

    //buscamos a todos lo usuarios y después se muestran
    const users = await userRepository.find({
        relations: {
            //contacts: true,
            userChief: true,
            state: true
            //misMovs: true,

        }, withDeleted: true,
        select: {
            userChief: {
                name: true
            }
        }
    });
    res.json({
        users
    })
}


export const getOneUser = async (req: Request, res: Response) => {
    const userRepository = appDataSource.getRepository(User);


    const { id } = req.params;


    const userFind = await userRepository.findOne({
        where: { id: id },
        relations: {
            misMovs: {
                createdBy: true,
                movType: true
            },
            userChief: true,
            state: true,
            contacts: true
        },
        select: {
            misMovs: {
                id: true,
                createdAt: true,
                createdBy: {
                    id: true,
                    name: true
                }
            }
        }
    });

    if (!userFind) {
        return res.status(404).json({
            error: `El usuario con el id: ${id} no existe`
        })
    }
    res.json({
        user: userFind
    })
}

export const upDateUser = async (req: Request, res: Response) => {
    const userUpDate = plainToInstance(upDateUserDTO, req.body);
    const { id } = req.params;

    //definición de repositorios/
    const userRepository = appDataSource.getRepository(User);
    const bitacoraReposirtory = appDataSource.getRepository(Bitacora);

    //verifica la existencia del usuario
    const userFind = await userRepository.findOne({ where: { id: id } })
    if (!userFind) {
        return res.status(404).json({
            error: 'Usuario no encontrado'
        })
    }

    //Inicio de transacción 
    const queryRunner = appDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
        const userSave = userRepository.create({
            ...userFind, ...userUpDate, id
        })
        await queryRunner.manager.save(userSave)

        const bita = bitacoraReposirtory.create({
            userModificado: userFind,
            createdBy: req.user,
            movType: {
                id: ValidStateMov.vacaciones
            }
        })
        await queryRunner.manager.save(bita)
        await queryRunner.commitTransaction()

        res.json({
            user: userSave
        })

    } catch (error) {
        await queryRunner.rollbackTransaction()
        res.status(500).json({
            error: `${error}`
        })
    } finally {
        await queryRunner.release()
    }
}


export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRepository = appDataSource.getRepository(User);
    try {
        const user = await userRepository.findOneBy({
            id
        })

        if (!user) {
            return res.status(400).json({
                error: `Usuario no exiistente`
            })
        }

        await userRepository.save({...user, status:false})
        await userRepository.softDelete({id})
       
        res.json({
            user
        })
    } catch (error: any) {
        res.status(error.statusCode).json({
            error: error.message
        })
    }
}



export const reactivatedUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRepository = appDataSource.getRepository(User);

    try {
        const user = await userRepository.findOne({where:{id}, withDeleted:true})

        if (!user) {
            return res.status(400).json({
                error: `Usuario no exiistente`
            })
        }
        if(user.status){
            return res.status(400).json({
                error: `El usuario ya está activo`
            })
        }
        await userRepository.save({...user, status:true})
        await userRepository.restore({id})

        res.json({
            user
        })

    } catch (error: any) {

        res.status(error.statusCode).json({
            error: error.message
        })
    }
}
