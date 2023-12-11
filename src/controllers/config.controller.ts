import { Request, Response } from "express";

export const getRoles = (req:Request, res: Response) =>{
    
    res.json({
        roles: [
            'Admin',
            'Manager',
            'Consultas',
            'User'
        ]
    })
}

export const getStates = (req:Request, res: Response) =>{
    res.json({
        states:  ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Distrito Federal', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'].map((state, idx) => {
            return {
                id:idx+1,
                name:state
            }
        })
    })
}