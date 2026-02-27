import { NextFunction, Request, Response } from "express";
import { AddressService } from "../services/address.service";

export class AddressController {
    constructor(
        private readonly service = new AddressService()
    ){}

    public create = async(req:Request, res: Response, next: NextFunction) => {
        const createDTO = req.body;
        const {user_id} = req.params;
        try {
            const address = await this.service.create(user_id, createDTO);
            res.json(address);
        } catch (error) {
            next(error);
        }
    }

    public getOne = async(req:Request, res: Response, next: NextFunction) => {
        const {user_id} = req.params;
        try {
            const address = await this.service.getOne(user_id);
            res.json(address);
        } catch (error) {
            next(error);
        }
    }

    public update = async(req:Request, res: Response, next: NextFunction) => {
        const updateDTO = req.body;
        const {user_id} = req.params;
        try {
            const address = await this.service.update(user_id, updateDTO);
            res.json(address);
        } catch (error) {
            next(error);
        }
    }


}