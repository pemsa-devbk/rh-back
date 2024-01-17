// import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { appDataSource } from "../db/dataBase";
import { User } from "../db/entities/user.entity";
import { Contact } from "../db/entities/contact.entity";
import { CreateContactDTO } from "../Dto/contact/createContact.dto";
import { plainToInstance } from "class-transformer";
import { validRoles } from "../types/enums/roles";
import { UpDateContactDTO } from "../Dto/contact/upDateContact.dto";
// import { CreateContactDTO } from "../Dto/contact/createContact.dto";
// import { appDataSource } from "../db/dataBase";
// import { Contact } from "../db/entities/contact.entity";

export const createContact = async (req: Request, res: Response) => {
    //logica de negocio: Buscamos si existe user al que se le va a signar contact
    
    const createContact = plainToInstance(CreateContactDTO, req.body);
    const userRepository = appDataSource.getRepository(User);
    const {id} = req.params;

    const contactRepository = appDataSource.getRepository(Contact);
    const userFind = await userRepository.findOne({where:{id:id}});
    if(!userFind){
        return res.status(401).json({
            error: `No hay registro del usuario: ${userFind.name}`
        })
    }
    
    //creamos el contacto:
    const contact = contactRepository.create({...createContact, user:userFind})
    await contactRepository.save(contact);
    
    //y mostramos al contacto
    res.json({
       contact
    })
}


// TODO: Validar 
//GET ALL CONTACTS USER-ID
export const getAllContact = async (req: Request, res: Response) => {
    //logica de negocio:
    const contactRepository = appDataSource.getRepository(Contact);
    //const contactRepository = appDataSource.getRepository(Contact);

    //Para que el usuario no vea los contactos de otros, solo el suyo

    //Buscamos al usuario:
    const contactFind = await contactRepository.find({

        
    });
    
    //se muestra el contacto por usuario:
    res.json({
        contactFind
    })
}





// TODO
export const getOneContact = async (req: Request, res: Response) => {
    //logica de negocio:
    const contactRepository = appDataSource.getRepository(Contact);
    const {id} = req.params;
    //const contactRepository = appDataSource.getRepository(Contact);

    //Para que el usuario no vea los contactos de otros, solo el suyo
    if(req.user.rol == validRoles.USER && req.user.id != id){
        return res.status(401).json({
            error: `No se tinen los permisos para esta acción`
        })
    }

    //Buscamos al usuario:
    const contactFind = await contactRepository.findOne({where: {id:+id}});
    if(!contactFind){
        return res.status(401).json({
            error: `No se ha encontrado el contacto`
        })
    }
    
    //se muestra el contacto por usuario:
    res.json({
        contactFind
    })
}



export const upDateContact = async (req: Request, res: Response) => {
    //logica de negocio:
    const contactUpDate = plainToInstance (UpDateContactDTO, req.body);
    const contactRepository = appDataSource.getRepository(Contact);
    const {id} = req.params;
    

    let contact = await contactRepository.findOne({where: {id: +id}})

    if(!contact){
        return res.status(401).json({
            error: `No existe el contacto`
        })
    }
    contact = await contactRepository.save({
        ...contact,
        ...contactUpDate
    })

    res.json({
        contact
    })
}


export const deleteContact = async (req: Request, res: Response) => {
    //logica de negocio n.n
    
    const contactRepository = appDataSource.getRepository(Contact);
    const {id} = req.params;

    //buscamos el contacto y luego lo eliminamos n.n
    const contactFind = await contactRepository.findOne({where:{id: +id}});
    if(!contactFind){
        return res.status(401).json({
            error: `Contacto no existente`
        })
    }
    
    const contactDelete = await contactRepository.remove( contactFind )
    res.json({
        contactDelete
    })
}