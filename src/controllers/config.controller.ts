import { NextFunction, Request, Response } from "express";
import { ConfigService } from "../services/config.service";
import { plainToInstance } from "class-transformer";
import { AssignUserDto } from "../Dto/config/assignUser.dto";
import { CreateConfigDto } from "../Dto/holidays/create_config.dto";
import { UpdateConfigDto } from "../Dto/holidays/update_config.dto";


export class ConfigController {
    constructor(
        private readonly configService = new ConfigService()
    ){}

    public assignUser = async(req:Request, res:Response, next: NextFunction) => {
        const assignDto = plainToInstance(AssignUserDto, req.body);
        try {
            await this.configService.assignUser(assignDto);
            res.json({
                msg: 'Se actualizo correctamnete'
            })
        } catch (error) {
            next(error);
        }
    }

    public getConfiguration = async(req:Request, res:Response, next: NextFunction) => {
        try {
            const config = await this.configService.getSystemConfiguration();
            res.json({
                config
            })
        } catch (error) {
            next(error);
        }
    }
    
    public getRoles = (req:Request, res:Response, next: NextFunction) => {
        try {
            const roles = this.configService.getRoles();
            res.json({
                roles
            })
        } catch (error) {
            next(error);
        }
    }

    public getConfigHoliday = async(req:Request, res:Response, next: NextFunction) => {
        try {
            const config = await this.configService.getHolidaysConfig();
            res.json({
                config
            })
        } catch (error) {
            next(error);
        }
    }
    public createConfigHoliday = async (req:Request, res:Response, next: NextFunction) => {
        const dto = plainToInstance(CreateConfigDto, req.body);
        try {
            const response = await this.configService.createConfigHoliday(dto);
            res.json({
                response
            })
        } catch (error) {
            next(error);
        }
    }
    public updateConfig = async(req:Request, res:Response, next: NextFunction) => {
        const {id} = req.params;
        const dto = plainToInstance(UpdateConfigDto, req.body);
        try {
            const response = await this.configService.updateConfig(+id, dto);
            res.json({
                response
            })
        } catch (error) {
            next(error);
        }
    }

    public deleteConfig = async(req:Request, res:Response, next: NextFunction) => {
        const {id} = req.params;
        try {
            const response = await this.configService.deleteConfig(+id);
            res.json({
                response
            })
        } catch (error) {
            next(error);
        }
    }
}
