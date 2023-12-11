import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { CreateMovDto } from "../Dto/mov/createMov.dto";
import { appDataSource } from "../db/dataBase";
import { Mov } from "../db/entities/movs.entity";
import { UpDateMov } from "../Dto/mov/upDateMov.dto";


export const createMov = async (req: Request, res: Response) => {
    //logica de negocio:   crear mov pasar de txto plano y crear Repository
    const movToCreate = plainToInstance (CreateMovDto, req.body);
    const movRepository = appDataSource.getRepository(Mov);

    //crear mov a traves de repository, haciendo desestructuración 
    const mov = movRepository.create({
        ...movToCreate
    })
    //y guardamos 
    const movCreate = await movRepository.save(mov)
    res.json ({
        mov: movCreate
    })
}


export const getAllMovs = async (req: Request, res: Response) => {
    //logica de negocio
    const movRepository = appDataSource.getRepository(Mov);
    
    //buscamos a todos los movimientos
    const movs = await movRepository.find();

    res.json({
        movs
    })
}


export const getOneMovs = async (req: Request, res: Response) => {
    //logica de negocio: 
    //pasar a texto plano y buscar por id
    const movRepository = appDataSource.getRepository(Mov);
    const {id} = req.params;

    //buscamos id
    const movFind = movRepository.findOne({where:{id:+id}})
    if(!movFind){
        return res.status(401).json({
            error: `Error: El movimiento con di: ${id} no existe`
        })
    }
    res.json({
        mov:movFind
    })
}


export const upDateMov = async (req: Request, res: Response) => {
    //logica de negocio:
    const movUpDate = plainToInstance(UpDateMov, req.body);
    const {id} = req.params
    
    //primero se busca por id
    const movRepository = appDataSource.getRepository(Mov);
    const movFind = await movRepository.findOne({where:{id:+id}});
    if(!movFind){
        return res.status(404).json({
            error:  `Error, el movimiento con id: ${id} no se realizó`
        })
    }// en caso de encontrar el mov entocnces se actualiza así:
    const mov = movRepository.save({
        ...movUpDate,
        id: +id
    })
    res.json({
        ...movFind,
        ...mov
    })
}


export const deleteMov = async (req: Request, res: Response) => {
    //logica de negocio:
    const movRepository = appDataSource.getRepository(Mov);
    const { id } = req.params;
    const movFind = await movRepository.findOne({where:{id:+id}});
    
    if(!movFind){
        return res.status(404).json
    }
    res.json({
        error: 'error'
    })
}
