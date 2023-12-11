import { Request, Response } from "express";
import { User } from "../db/entities/user.entity";
import { appDataSource } from "../db/dataBase";


// export const getAllRoles = async (req: Request, res: Response) => {
//     //lógica de negocio: 
//     //crear el repository para obtener todos los usuarios:
//     const readRoles = {
//         admin: 'Admin',
//         manager: 'Manager',
//         consultas: 'Consultas',
//         user: 'User'
//     };

   
//     // //buscamos a todos lo usuarios y después se muestran
//     //console.log(Object.values(validRoles));
    
//     return readRoles;
// }



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
        select:{
            userChief:{
                name:true
            }
        }
    });
    res.json({
        users
    })
}
