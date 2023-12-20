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
import {join} from 'path'
import {existsSync, readFileSync} from 'fs'
import jsPDF from 'jspdf';


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
    // const pathFile = join(__dirname, "..", "..", "docs", userToCreate.id);

    try {
        // del uausario a crear debemos 
        const user = userRepository.create({
            ...userToCreate,
            password: bcrypt.hashSync(password, 10),
            urlPhoto: enviroment.API_PATH + '/users/img/' + req.file.filename
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

export const photoUser = (req:Request, res:Response) => {
    const {id} = req.params;
    const pathFile = join(__dirname, "..", "..", "docs", id, "img.jpg");
    if (!existsSync(pathFile))return res.status(404).json({
        msg: 'No existe'
    })

    res.sendFile(pathFile)
}


export const credencial = async (req:Request, res:Response) => {

    const {id} = req.params;
    const pathFile = join(__dirname, "..", "..", "docs", id);
    const userRepository = appDataSource.getRepository(User);


    const userFind = await userRepository.findOne({
        where: { id: id },
    });

    if (!userFind) {
        return res.status(404).json({
            error: `El usuario con el id: ${id} no existe`
        })
    }

    console.log(userFind);
    
    createCredencial(userFind)

   res.sendFile(`${pathFile}/credencial.pdf`)
}

export const publicUser = async( req:Request, res:Response ) => {
    const userRepository = appDataSource.getRepository(User);

    const {id} = req.params;
    const user = await userRepository.findOne({
        where:{ id:id},
        select:{
            id:true,
            name:true,
            position:true,
            status:true
        },
    });
   
    
    res.json({
        user
    })
}

const createCredencial = (user:User) => {

    const pathFile = join(__dirname, "..", "..", "docs", user.id);
    
    const doc = new jsPDF();

    
    const img = readFileSync(`${pathFile}\\img.jpg`);
    doc.addImage(img, "JPEG", 5, 47, 60, 70);
    doc.setFontSize(30);
    doc.setTextColor(254, 5, 5);
    doc.text("CREDENCIAL", 10, 30);
    doc.setFillColor(254, 5, 5);
    doc.rect(5, 32, 150, 5, "F");
    doc.setFillColor(0, 0, 102);
    doc.rect(5, 41, 150, 5, "F");

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text(user.name, 70, 70);
    doc.setFontSize(16);
    doc.text(user.position, 70, 80);


    //textos en  rojo
    doc.setFontSize(14);
    doc.setTextColor(254, 5, 5);
    doc.text("NO. EMPLEADO:", 70, 90);
    doc.text("TIPO DE SANGRE:", 130, 90);
    doc.text("VIGENCIA:", 70, 100);
    doc.text("NSS:", 130, 100);
    doc.text("TELÉFONO:", 70, 110);
    doc.text("CUIP:", 130, 110);
    doc.text("ALÉRGICO A ALGÚN MEDICAMENTO:", 70, 120);
    doc.text("CURP:", 70, 130);
    doc.text("DOMICILIO:", 70, 140);
    doc.text("FIRMA DEL USUARIO:", 5, 155);

    //TEXTOS EN NEGRO (EDITAR)
    doc.setTextColor(0, 0, 0);
    doc.text(user.id, 112, 90);
    doc.setFont("helvetica", "bold")
    doc.text(user.bloodType||"", 175, 90);
    doc.text("2024", 97, 100);
    doc.text(user.nss||"", 143, 100);
    doc.text(user.phone||"", 100, 110);
    doc.text(user.allergies||"Ninguno", 160, 120);
    doc.text(user.curp, 90, 130);
    doc.text(user.address||"", 100, 140, {maxWidth: 90});



    //PARTE TRASERA
    doc.setFillColor(254, 5, 5);
    doc.rect(5, 170, 150, 5, "F");
    doc.setFillColor(0, 0, 102);
    doc.rect(5, 179, 150, 5, "F");

    doc.text("FIRMA DEL REPRESENTANTE LEGAL", 105, 215, undefined, "center");
    doc.text("PROTECCION ELECTRONICA MONTERREY S.A. DE C.V.", 105, 222, undefined, "center");
    doc.text("33 PONIENTE 307 COL. CHULAVISTA C.P. 72420", 105, 229, undefined, "center");
    doc.text("PUEBLA, PUE. T:222 141 1230 / 222 243 3339 / 222 240 6378", 105, 235, undefined, "center");
    doc.text("www.pem-sa.com", 105, 242, undefined, "center");
    
    doc.text("PERIMISO SSP FEDERAL: DGSP/303-16/3302", 105, 250, undefined, "center");
    doc.text("PERMISO SSP EDO. DE PUEBLA: SSP/SUBCOP/DGSP/114-15/109", 105, 257, undefined, "center");
    doc.text("REPSE: STPS/UTD/DGIFT/AR10508/2021", 105, 263, undefined, "center");
    doc.text("Registro Patronal: E061123710", 105, 270, undefined, "center");
    doc.text("ESTE DOCUMENTO ES OFICIAL DE PROTECCION ELETRONICA MONTERREY S.A. DE C.V.", 105, 280, undefined, "center");
    doc.text("AMPARA SERVICIOS Y RESPONABILIDADES. ES PERSONAL E INTRANSFERIBLE", 105, 287, undefined, "center");

    doc.save(`${pathFile}/credencial.pdf`);
}
