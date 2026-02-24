import { Request, Response } from "express";
import { ConfigService } from "../services/config.service";
import { plainToInstance } from "class-transformer";
import { AssignUserDto } from "../Dto/config/assignUser.dto";
import { CreateConfigDto } from "../Dto/holidays/create_config.dto";
import { UpdateConfigDto } from "../Dto/holidays/update_config.dto";


export class ConfigController {
    constructor(
        private readonly configService = new ConfigService()
    ){}

    public assignUser = async(req:Request, res:Response) => {
        const assignDto = plainToInstance(AssignUserDto, req.body);
        try {
            await this.configService.assignUser(assignDto);
            res.json({
                msg: 'Se actualizo correctamnete'
            })
        } catch (error) {
            console.log('error');
        }
    }

    public getConfiguration = async(req:Request, res:Response) => {
        try {
            const config = await this.configService.getSystemConfiguration();
            res.json({
                config
            })
        } catch (error) {
            console.log(error);
        }
    }
    public getRoles = (req:Request, res:Response) => {
        try {
            const roles = this.configService.getRoles();
            res.json({
                roles
            })
        } catch (error) {
            console.log(error);
        }
    }

    public getConfigHoliday = async(req:Request, res:Response) => {
        console.log('1');
        try {
            
            const config = await this.configService.getHolidaysConfig();
            console.log('2');
            res.json({
                config
            })
        } catch (error) {
            console.log(error);
        }
    }
    public createConfigHoliday = async (req:Request, res:Response) => {
        const dto = plainToInstance(CreateConfigDto, req.body);
        try {
            const response = await this.configService.createConfigHoliday(dto);
            res.json({
                response
            })
        } catch (error) {
            console.log(error);
        }
    }
    public updateConfig = async(req:Request, res:Response) => {
        const {id} = req.params;
        const dto = plainToInstance(UpdateConfigDto, req.body);
        try {
            const response = await this.configService.updateConfig(+id, dto);
            res.json({
                response
            })
        } catch (error) {
            console.log(error);
        }
    }

    public deleteConfig = async(req:Request, res:Response) => {
        const {id} = req.params;
        try {
            const response = await this.configService.deleteConfig(+id);
            res.json({
                response
            })
        } catch (error) {
            console.log(error);
        }
    }
}
