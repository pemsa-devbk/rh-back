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
import { join } from 'path'
import { readFileSync, readdirSync } from 'fs'
import jsPDF from 'jspdf';
import qrcode from 'qrcode'
import base64 from 'base-64'


export const createUser = async (req: Request, res: Response) => {

    if (!req.file) {
        return res.json({
            error: `Error al no subir archivo`
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
            error: `${userToCreate.id} Existe un usuario con este id`
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
        await createdQR(user.id)

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

        await userRepository.save({ ...user, status: false })
        await userRepository.softDelete({ id })

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
        const user = await userRepository.findOne({ where: { id }, withDeleted: true })

        if (!user) {
            return res.status(400).json({
                error: `Usuario no exiistente`
            })
        }
        if (user.status) {
            return res.status(400).json({
                error: `El usuario ya se encuentra activo`
            })
        }
        await userRepository.save({ ...user, status: true })
        await userRepository.restore({ id })

        res.json({
            user
        })

    } catch (error:any) {

        res.status(error.statusCode).json({
            error: error.message
        })
    }
}

export const photoUser = (req: Request, res: Response) => {
    const { id } = req.params;

    const pathFile = join(__dirname, "..", "..", "docs", id);
    const files = readdirSync(pathFile);
    
    const fileImgUser = files.find(file => file.includes('img'));
    if (!fileImgUser) return res.status(404).json({
        msg: 'No existe'
    })

    res.sendFile(`${pathFile}/${fileImgUser}`)
}


export const credencial = async (req: Request, res: Response) => {

    const { id } = req.params;
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

    createCredencial(userFind)

    res.sendFile(`${pathFile}/credencial.pdf`)
}

export const publicUser = async (req: Request, res: Response) => {
    const userRepository = appDataSource.getRepository(User);

    const { id } = req.params;
    const user = await userRepository.findOne({
        where: { id: id },
        select: {
            id: true,
            name: true,
            position: true,
            status: true,
            urlPhoto: true
        }
    });


    res.json({
        user
    })
}

const createCredencial = async(user: User) => {

    const pathFile = join(__dirname, "..", "..", "docs");
    

    const doc = new jsPDF({
        unit: 'px',
    });
    const logo1 = readFileSync(join(__dirname,"../..","public/img/logo1.png"));
    const logo2 = readFileSync(join(__dirname,"../..","public/img/logo2.png"));
    const imgRP = readFileSync(`${pathFile}/21003/firma.png`);
    const files = readdirSync(`${pathFile}/${user.id}`);
  
    const fileImgUser = files.find(file => file.includes('img'));
    
    const firmUser = readFileSync(`${pathFile}/${user.id}/firma.png`);
    const qrUser = readFileSync(`${pathFile}/${user.id}/qr.png`);

    //User image
    fileImgUser && doc.addImage(readFileSync(`${pathFile}/${user.id}/${fileImgUser}`), fileImgUser.includes('png')? "PNG" :"JPEG", 18, 104.91, 114, 128);
    // logo 1 image
    doc.addImage(logo1, "PNG", 348, 52.91, 91, 66);
    // logo 2 image
    doc.addImage(logo2, "PBG", 348, 333.91, 91, 115);
    // QR image
    doc.addImage(qrUser, "PNG", 18, 388.91, 91, 91);
    // firma user image
    doc.addImage(firmUser, "PNG", 18, 251.91, 114, 45);
    // firma rep legal 
    doc.addImage(imgRP, "PNG", 153, 385.91, 137, 39);


    doc.setFont("helvetica", "bold")
    doc.setFontSize(22.28);
    doc.setTextColor(162, 35, 40);
    doc.text("CREDENCIAL", 23, 68.91);
    doc.setFillColor(162, 35, 40);
    doc.rect(9, 71.91, 324, 11, "F");
    doc.setFillColor(0, 0, 102);
    doc.rect(9, 91.91, 324, 11, "F");


    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(17.6);
    doc.text(user.name, 147, 138.91);
    doc.setFontSize(13.11);
    doc.text(user.position, 147, 155.91);


    //textos en  rojo
    doc.setFontSize(11.23);
    doc.setTextColor(162, 35, 40);
    doc.text("NO. EMPLEADO:", 147, 177.91);
    doc.text("TIPO DE SANGRE:", 305, 177.91);
    doc.text("VIGENCIA:", 147, 198.91);
    doc.text("NSS:", 305, 198.91);
    doc.text("TELÉFONO:", 147, 218.91);
    doc.text("CUIP:", 305, 218.91);
    doc.text("ALÉRGICO A ALGÚN MEDICAMENTO:", 147, 241.91);
    doc.text("CURP:", 147, 262.91);
    doc.text("DOMICILIO:", 147, 282.91);
    doc.text("FIRMA DEL USUARIO", 31, 309.91);

    //TEXTOS EN NEGRO (EDITAR)
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold")
    doc.text(user.id, 235, 177.91);
    doc.text(user.bloodType || "", 395, 177.91);
    doc.text("2024", 235, 198.91);
    doc.text(user.nss || "", 355, 198.91);
    doc.text(user.phone || "", 235, 218.91);
    doc.text(user.cuip || "82952592", 341, 218.91);
    doc.text(user.allergies || "Ninguno", 309, 241.91);
    doc.text(user.curp, 235, 262.91);
    doc.text(user.address || "", 235, 282.91, { maxWidth: 180 });

    //PARTE TRASERA
    doc.setFillColor(162, 35, 40);
    doc.rect(9, 344.91, 324, 11, "F");
    doc.setFillColor(0, 0, 102);
    doc.rect(9, 364.91, 324, 11, "F");

    doc.setFontSize(9.36);
    doc.setTextColor(0, 0, 102);
    doc.text("FIRMA DEL REPRESENTANTE LEGAL", 223, 432.91, undefined, "center");
    doc.text("PROTECCION ELECTRONICA MONTERREY S.A. DE C.V.", 223, 446.91, undefined, "center");
    doc.text("33 PONIENTE 307 COL. CHULAVISTA C.P. 72420", 223, 458.91, undefined, "center");
    doc.text("PUEBLA, PUE. T:222 141 1230 / 222 243 3339 / 222 240 6378", 223, 470.91, undefined, "center");
    doc.text("www.pem-sa.com", 223, 484.91, undefined, "center");

    doc.text("PERIMISO SSP FEDERAL: DGSP/303-16/3302", 223, 502.91, undefined, "center");
    doc.text("PERMISO SSP EDO. DE PUEBLA: SSP/SUBCOP/DGSP/506-23/460", 223, 516.91, undefined, "center");
    doc.text("REPSE: STPS/UTD/DGIFT/AR10508/2021", 223, 527.91, undefined, "center");
    doc.text("Registro Patronal: E061123710", 223, 539.91, undefined, "center");
    doc.text("ESTE DOCUMENTO ES OFICIAL DE PROTECCION ELETRONICA MONTERREY S.A. DE C.V.", 223, 559.91, undefined, "center");
    doc.text("AMPARA SERVICIOS Y RESPONABILIDADES. ES PERSONAL E INTRANSFERIBLE", 223, 572.91, undefined, "center");


    doc.save(`${pathFile}/${user.id}/credencial.pdf`);
}

const createdQR = async (id:string) => {
    const pathFile = join(__dirname, "..", "..", "docs", id, "qr.png");
    const idEncode = base64.encode(id);
    await qrcode.toFile(pathFile, `https://www.pem-sa.com.mx/personal/${idEncode}`, {type: 'png'})
}