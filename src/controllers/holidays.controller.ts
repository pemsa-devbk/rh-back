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
        const { employee_id } = req.params;
        const holidayDto = req.body;
        try {
            const response = await this.holidayService.create(employee_id, req.user.user_id, holidayDto);
            res.json(
                response
            );
        } catch (error) {
            next(error);
        }
    }

    public getHolidaysByUser = async (req: Request, res: Response, next: NextFunction) => {
        const { employee_id } = req.params;
        const paginationDto = plainToInstance(PaginationDto, req.query);
        try {
            const [holidays, total] = await this.holidayService.getHolidaybyEmployee(employee_id, paginationDto);
            res.json({
                data: holidays,
                total
            })
        } catch (error) {
            next(error);
        }
    }

    public cancel = async (req: Request, res: Response, next: NextFunction) => {
        const { employee_id, holiday_id } = req.params;
        try {
            const message = await this.holidayService.cancel(employee_id, +holiday_id);
            res.json({
                message
            })
        } catch (error) {
            next(error);
        }
    }

    public getFormat = async (req: Request, res: Response, next: NextFunction) => {
        const { employee_id, holiday_id } = req.params;
        try {
            const [filename, dir, mimeType] = await this.holidayService.getFormatHoliday(employee_id, +holiday_id);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', mimeType);
            res.download(dir, filename, err => {
                if (err) {
                    res.status(500).json({ message: "Error al descargar el archivo" })
                }
            })
        } catch (error) {
            next(error);
        }
    }

    public uploadFormat = async (req: Request, res: Response, next: NextFunction) => {
        const { employee_id, holiday_id } = req.params;
        try {
            const message = await this.holidayService.uploadFormat(employee_id,+holiday_id, req.files);
            res.json({
                message
            })
        } catch (error) {
            next(error);
        }
    }
}


