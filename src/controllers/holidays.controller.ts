import { plainToInstance } from "class-transformer";
import { NextFunction, Request, response } from "express";
import { Response } from "express-serve-static-core";
import { PaginationDto } from "../Dto/pagination.dto";
import { HolidayService } from "../services/holiday.service";


export class HolidayController {
    constructor(
        private readonly holidayService = new HolidayService(),
    ) { }

    public create = async (req: Request, res: Response, next: NextFunction) => {
        const { user_id } = req.params;
        const holidayDto = req.body;
        try {
            const response = await this.holidayService.create(user_id, req.user.user_id, holidayDto);
            res.json(
                response
            );
        } catch (error) {
            next(error);
        }
    }

    public getHolidaysByUser = async (req: Request, res: Response, next: NextFunction) => {
        const { user_id } = req.params;
        const paginationDto = plainToInstance(PaginationDto, req.query);
        try {
            const [holidays, total] = await this.holidayService.getHolidaybyEmployee(user_id, paginationDto);
            res.json({
                data: holidays,
                total
            })
        } catch (error) {
            next(error);
        }
    }

    public cancel = async (req: Request, res: Response, next: NextFunction) => {
        const { user_id, holiday_id } = req.params;
        try {
            const message = await this.holidayService.cancel(user_id, +holiday_id);
            res.json({
                message
            })
        } catch (error) {
            next(error);
        }
    }


    public getFormat = async (req: Request, res: Response, next: NextFunction) => {
        const { user_id, holiday_id } = req.params;
        try {
            const [name, buffer] = await this.holidayService.getFormatHoliday(user_id, +holiday_id);
            res.setHeader('Content-Type', 'application/pdf');
            res.header('Access-Control-Expose-Headers', 'Content-Disposition')
            res.setHeader('Content-Disposition', `inline; filename=${name}`);
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }

    

    public uploadFormat = async (req: Request, res: Response, next: NextFunction) => {
        const { user_id, holiday_id } = req.params;
        try {
            const message = await this.holidayService.uploadFormat(user_id,+holiday_id, req.file);
            res.json({
                message
            })
        } catch (error) {
            next(error);
        }
    }

    
}


