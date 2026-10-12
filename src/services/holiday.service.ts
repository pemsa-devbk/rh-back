import { appDataSource } from "../db/dataBase";
import { HolidayRequest } from "../db/entities/holidays_request";
import { CreateRequestHolidaysDto } from "../Dto/holidays/create_request.dto";
import { StatusHoliday } from "../types/enums/status_holidays";
import dayjs from '../utils/dayjs'
import { HolidayDays } from '../db/entities/holidays_days';
import { Binnacle } from "../db/entities/binnacle.entity";
import { ValidStateMov } from "../types/enums/validMov";
import { join } from 'path';
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import jsPDF from "jspdf";
import { SystemConfiguration } from "../db/entities/system_configuration";
import { HolidaysConfig } from "../db/entities/holidays_config";
import { PaginationDto } from "../Dto/pagination.dto";
import { StatusUser } from "../types/enums/status_user";
import { Between, EntityManager, In, Not } from "typeorm";
import { Position } from "../db/entities/position.entity";
import { Employee } from "../db/entities/employee.entity";
import { CustomError } from "../utils/error";
import { FileArray } from "express-fileupload";
import mime from 'mime'


interface TextRich {
    text: string;
    style?: string;
    underline: boolean;
}

/**
 Para crear una solicitud de vacaiones 
 1. Validar que el usuario exista
 2. Validar que no tenga vacaciones en los rangos de fecha de solicitud.
 3. Validar si la fecha final de vacaciones sea posterior al dia actual
 */
// TODO 
/**
 * 2. Se pueden cancelar todas las vacaciones excepto si ya fue cancelado
 * 3. Verificar documento de creación
 */
export class HolidayService {

    private dir = join(__dirname, "..", "..", "uploads", 'employees');
    constructor(
        private readonly holidayRequestRepository = appDataSource.getRepository(HolidayRequest),
        private readonly holidayConfigRepository = appDataSource.getRepository(HolidaysConfig)
    ) { }

    public async create(employee_id: string, modifier_id: string, createDto: CreateRequestHolidaysDto) {
        const { days, comment } = createDto;
        const today = dayjs.tz();
        const sortedDates = this.validateHolidayDays(days);

        return await this.holidayRequestRepository.manager.transaction(async (transactionalEntityManager) => {
            const employee = await transactionalEntityManager.findOne(Employee, { where: { user_id: employee_id }, relations: { position: true, boss: true, user: true } });
            if (!employee) throw 'Usuario no encontrado';
            // * Validar que no existan vacaciones cruzadas
            const maxDate = sortedDates[sortedDates.length - 1];

            const crossHoliday = await transactionalEntityManager
                .createQueryBuilder(HolidayRequest, 'holiday')
                .innerJoin('holiday.days', 'day')
                .where('holiday.employee_id = :employee_id', { employee_id })
                .andWhere('holiday.status NOT IN (:...statuses)', {
                    statuses: [
                        StatusHoliday.CANCELADA,
                        StatusHoliday.RECHAZADA
                    ]
                })
                .andWhere('day.date IN (:...dates)', {
                    dates: days
                })
                .getExists();

            if (crossHoliday) throw new CustomError('Ya existe un registro de vacaciones entre las fechas solicitadas', 400);

            let status = StatusHoliday.APROBADA;
            // * Registro de vacaciones que ya pasaron
            if (today.isAfter(maxDate, 'date') || today.isSame(maxDate.add(1, 'day'), 'date')) status = StatusHoliday.FINALIZADA;

            // * Crear solicitud
            await transactionalEntityManager.update(Employee, { user_id: employee_id }, { vacation_days: (employee.vacation_days - days.length) })
            const holydayRequest = transactionalEntityManager.create(HolidayRequest, { employee_id, status, comment });
            await transactionalEntityManager.insert(HolidayRequest, holydayRequest);

            // * Días de vacaciones
            const daysRequest = transactionalEntityManager.create(HolidayDays, days.map(day => ({
                date: day,
                request_holiday_id: holydayRequest.request_holiday_id
            })));
            await transactionalEntityManager.insert(HolidayDays, daysRequest);
            // * Bitacora
            await transactionalEntityManager.insert(Binnacle, { modifier_user_id: modifier_id, modified_user_id: employee_id, type: ValidStateMov.vacaciones });

            holydayRequest.days = daysRequest;
            // * Crear documento
            // await this.createDoc(transactionalEntityManager, holydayRequest, employee);
            const othersText = this.formatVacationDates(daysRequest);
            return {
                message: `Solicitud de vacaciones creada para la(s) fecha(s) ${othersText.text} del empleado ${employee.user.name}`,
                id: holydayRequest.request_holiday_id
            };
        })
    }

    public async getHolidaybyEmployee(employee_id: string, pagination: PaginationDto) {
        const { skip, take } = pagination;
        const [data, total] = await this.holidayRequestRepository.createQueryBuilder('holiday')
            .leftJoin('holiday.days', 'days')
            .addSelect(['days.date', 'days.holidays_days_id'])
            .where('holiday.employee_id = :employee_id', { employee_id })
            .take(take).skip(skip).getManyAndCount();

        return [
            data.map(holiday => ({
                ...holiday,
                others: this.formatVacationDates(holiday.days)
            })), total
        ];
    }

    public async cancel(employee_id: string, request_holiday_id: number) {
        return this.holidayRequestRepository.manager.transaction(async (transactionalEntityManager) => {
            const holiday = await transactionalEntityManager.findOne(HolidayRequest, { where: { employee_id, request_holiday_id }, relations: { days: true, employee: { user: true } } });
            if (!holiday) throw new CustomError('No hay registro de vacaciones', 400);
            if (holiday.status === StatusHoliday.CANCELADA) throw new CustomError("El registro ya ha sido cancelado", 400);
            // TODO Se va a cambiar el status ?
            // if (holiday.employee.status === StatusUser.vacaciones)
            //     await transactionalEntityManager.update(Employee, { user_id: employee_id }, { vacation_days: (holiday.employee.vacation_days + holiday.days.length), status: StatusUser.activo });
            await transactionalEntityManager.update(HolidayRequest, { request_holiday_id }, { status: StatusHoliday.CANCELADA });

            const othersText = this.formatVacationDates(holiday.days);
            return `Se cancelo la solicitud de vacaciones del usuario ${holiday.employee.user.name} para la(s) fecha(s) ${othersText.text}`;
        });
    }

    public async uploadFormat(employee_id: string, request_holiday_id: number, files: FileArray) {

        const simpleFile = files['proof'];
        if (Array.isArray(simpleFile)) throw new CustomError('Solo se acepta un archivo como comprobante', 400);
        return this.holidayRequestRepository.manager.transaction(async (transactionalEntityManager) => {
            const holiday = await transactionalEntityManager.findOne(HolidayRequest, { where: { request_holiday_id, employee_id } });
            if (!holiday) throw 'No existe registro de vacaciones';
            const pathFiles = join(this.dir, employee_id, "holidays");
            if (!existsSync(pathFiles)) throw "Directorio no existente comuniquese con el administrador";
            const fileExist = readdirSync(pathFiles).find(file => file.startsWith(`HOLIDAY_${request_holiday_id}.`));
            if (fileExist) rmSync(join(pathFiles, fileExist));

            const validaExten = simpleFile.name.split('.');
            const extenArch = validaExten.pop();
            await transactionalEntityManager.update(HolidayRequest, { request_holiday_id, employee_id }, { have_format: true });
            simpleFile.mv(join(pathFiles, `HOLIDAY_${request_holiday_id}.${extenArch}`));
            return 'Fomato actualizado';
        });
    }

    public async getFormatHoliday(employee_id: string, request_holiday_id: number): Promise<[string, string, string]> {

        const holiday = await this.holidayRequestRepository.findOne({ where: { request_holiday_id, employee_id }, relations: { employee: { user: true }, days: true } })
        if (!holiday) throw 'No hay registro de vacaciones';
        const pathFiles = join(this.dir, employee_id, "holidays");
        if (!existsSync(pathFiles)) throw "Directorio no existente comuniquese con el administrador";
        const fileExist = readdirSync(pathFiles).find(file => file.startsWith(`HOLIDAY_${request_holiday_id}.`));
        if (!fileExist) throw "Archivo no existente";

        const dirFile = join(pathFiles, fileExist);
        const mimeType = mime.getType(fileExist) || 'application/octet-stream';
        // const othersText = this.formatVacationDates(holiday.days);
        return [fileExist, dirFile, mimeType];
    }

    // * FALTA

    private async createDoc(transactionalEntityManager: EntityManager, holiday: HolidayRequest, employee: Employee) {

        const system = await transactionalEntityManager.find(SystemConfiguration, { relations: { employee: { user: true } } })
        const position = await transactionalEntityManager.findOne(Position, { where: { position_id: employee.position_id }, relations: { area: { responsibleUser: { user: true } } } });
        // * Validaciones de existencia
        if (!position.area.responsibleUser) throw 'El area no cuenta con un responsable';

        const path = join(__dirname, '../..', 'uploads/users', employee.user_id, 'holidays');
        const dayCreated = dayjs.tz(holiday.created_at);
        const doc = new jsPDF({
            compress: true
        });

        doc.setFont("helvetica");
        doc.setFontSize(12);

        const logo1 = readFileSync(join(__dirname, "../..", "public/img/logo1.png"));
        const holidayConfig = await this.holidayConfigRepository.find();

        doc.addImage(logo1, "PNG", 15, 15, 40, 40);

        doc.text(`PUEBLA, PUE A ${dayCreated.format('DD [de] MMMM [DEL] YYYY').toUpperCase()}.`, 200, 30, { align: 'right', maxWidth: 100 });
        doc.text("NOMBRE: ", 15, 65);
        let intText = employee.user.name.toUpperCase();
        doc.setLineWidth(0.5);
        doc.text(intText, 36, 65);
        doc.line(36, 65 + 1.5, 36 + doc.getTextWidth(intText), 65 + 1.5);

        doc.text("PUESTO: ", 15, 73);
        intText = position.name.toUpperCase();
        doc.setLineWidth(0.5);
        doc.text(intText, 36, 73);
        doc.line(36, 73 + 1.5, 36 + doc.getTextWidth(intText), 73 + 1.5);

        doc.text("SUCURSAL: __PUEBLA__", 200, 73, { align: "right" });
        const { text, nextDate } = this.formatVacationDates(holiday.days);
        // Partes de tu texto
        const parts = [
            { text: "POR MEDIO DE LA PRESENTE, SOLICITO ME SEAN AUTORIZADOS ", style: "normal", underline: false },
            { text: `${holiday.days.length} DÍAS`, style: "normal", underline: true },
            { text: " A CUENTA DE MIS VACACIONES. EL CUAL GOZARÉ EN LA FECHA DEL ", style: "normal", underline: false },
            { text: text, style: "bold", underline: true },
            { text: " REPORTÁNDOME A TRABAJAR EN EL DÍA ", style: "normal", underline: false },
            { text: nextDate.tz("America/Mexico_City").format("DD [DE] MMMM [DEL] YYYY[.]").toUpperCase(), style: "bold", underline: true }
        ];

        this.drawRichText(doc, parts, 15, 85, 180, 7);

        this.drawRichText(doc, [
            { text: "DÍAS ACUMULADOS DE PERIODOS ANTERIORES: ", underline: false },
            { text: employee.vacation_days.toString(), underline: true, style: 'bold' }
        ], 15, 113, 160, 10);

        let auxiliarText = '';
        const dateContract = dayjs() // dayjs(user.contract_date);
        const dateAcc = dayjs(dateContract).set('year', dayCreated.get('year'));
        let sumdays = false;
        if (dayCreated.isBefore(dateAcc)) // * En este año aun no aculuma días
            auxiliarText = `DÍAS POR ACUMULAR EN LA FECHA ${dateAcc.format('DD/MM/YYYY')}: `;
        else {
            auxiliarText = `DÍAS QUE ACUMULÓ A PARTIR DE LA FECHA ${dateAcc.format('DD/MM/YYYY')}: `;
            sumdays = true;
        }

        const diff = dayCreated.diff(dateContract, 'year');
        const daysToIncrement = holidayConfig.find(config => diff >= config.min_year && diff <= config.max_year).number_days || 0;

        // ? Verificar que datos se usan aquí
        this.drawRichText(doc, [
            // ? Esta es la fecha de contrato?
            { text: auxiliarText, underline: false },
            { text: daysToIncrement.toString(), underline: true, style: 'bold' }
        ], 15, 120, 160, 10);
        this.drawRichText(doc, [
            { text: "TOTAL DE DÍAS PENDIENTES POR DISFRUTAR: ", underline: false },
            { text: employee.vacation_days.toString(), underline: true, style: 'bold' }
        ], 15, 127, 160, 10);
        this.drawRichText(doc, [
            { text: "SALDO DE DÍAS QUE QUEDAN POR GOZAR: ", underline: false },
            { text: (employee.vacation_days - holiday.days.length).toString(), underline: true, style: 'bold' }
        ], 15, 134, 160, 10);

        this.drawRichText(doc, [
            { text: "AUTORIZADOS POR:", underline: true, style: 'italic' },
        ], 80, 144, 160, 10);

        doc.setFont("helvetica", "normal");
        doc.setLineWidth(0.5);
        doc.text("SOLICITANTE", 52, 155, { align: 'center', maxWidth: 75 });
        doc.line(15, 170, 90, 170);
        doc.text(employee.user.name.toUpperCase(), 52, 175, { align: 'center', maxWidth: 75 });

        doc.text("JEFE INMEDIATO", 157, 155, { align: 'center', maxWidth: 75 });
        doc.line(120, 170, 195, 170);
        doc.text(employee.boss.user.name.toUpperCase(), 157, 175, { align: 'center', maxWidth: 75 });

        doc.text("RECURSO HUMANOS", 52, 190, { align: 'center', maxWidth: 75 });
        doc.line(15, 205, 90, 205);
        doc.text(system.find(us => us.key == 'RH').employee.user.name.toUpperCase(), 52, 210, { align: 'center', maxWidth: 75 });

        doc.text("GERENTE DE ÁREA", 157, 190, { align: 'center', maxWidth: 75 });
        doc.line(120, 205, 195, 205);
        doc.text(position.area.responsibleUser.user.name.toUpperCase(), 157, 210, { align: 'center', maxWidth: 75 });

        doc.text("GERENTE ADMINISTRATIVO", 52, 225, { align: 'center', maxWidth: 75 });
        doc.line(15, 240, 90, 240);
        doc.text(system.find(us => us.key == 'GA').employee.user.name.toUpperCase(), 52, 245, { align: 'center', maxWidth: 75 });

        doc.text("GERENTE DE GENERAL", 157, 225, { align: 'center', maxWidth: 75 });
        doc.line(120, 240, 195, 240);
        doc.text(system.find(us => us.key == 'GG').employee.user.name.toUpperCase(), 157, 245, { align: 'center', maxWidth: 75 });

        return doc.save(`${path}/HOLIDAY_${holiday.request_holiday_id}.pdf`);
    }

    private drawRichText(doc: jsPDF, parts: Array<TextRich>, startX: number, startY: number, maxWidth: number, lineHeight: number) {
        let x = startX;
        let y = startY;

        parts.forEach(part => {
            // Set font style
            doc.setFont("helvetica", part.style || "normal");
            // Split text en palabras
            const words = part.text.split(" ");
            words.forEach((word, index) => {
                const spacer = index === words.length - 1 ? "" : " ";
                const wordWithSpace = word + spacer;

                const wordWidth = doc.getTextWidth(wordWithSpace);

                // Si pasa del ancho permitido → nueva línea
                if (x + wordWidth > startX + maxWidth) {
                    x = startX;
                    y += lineHeight;
                }

                // Dibujar texto
                doc.text(wordWithSpace, x, y);

                // Si subrayado → dibujar línea
                if (part.underline) {
                    doc.setLineWidth(0.5);
                    doc.line(x, y + 1.5, x + wordWidth, y + 1.5);
                }

                // Avanzar X
                x += wordWidth;
            });
        });
    }

    private formatVacationDates(dates: HolidayDays[]) {
        const sortedDates = dates.map(d => dayjs.tz(d.date)).sort((a, b) => a.valueOf() - b.valueOf());

        const minDate = sortedDates[0];
        const maxDate = sortedDates[sortedDates.length - 1];

        const formatFull = (date: dayjs.Dayjs) =>
            `${date.format('DD')} DE ${date.format('MMMM').toUpperCase()} DEL ${date.format('YYYY')}`;

        const formatDay = (date: dayjs.Dayjs) => date.format('DD');

        const sameMonth = minDate.month() === maxDate.month();
        const sameYear = minDate.year() === maxDate.year();

        let text = '';
        if (sortedDates.length === 1) {
            text = formatFull(minDate);
        } else if (sortedDates.length === 2) {
            const [first, second] = sortedDates;
            if (sameMonth && sameYear) {
                text = `${formatDay(first)} Y ${formatDay(second)} DE ${minDate.format('MMMM').toUpperCase()} DEL ${minDate.format('YYYY')}`;
            } else if (!sameMonth && sameYear) {
                text = `${formatDay(first)} DE ${first.format('MMMM').toUpperCase()} Y ${formatDay(second)} DE ${second.format('MMMM').toUpperCase()} DEL ${first.format('YYYY')}`;
            } else {
                text = `${formatFull(first)} Y ${formatFull(second)}`;
            }
        } else {
            if (sameMonth && sameYear) {
                text = `${formatDay(minDate)} AL ${formatDay(maxDate)} DE ${minDate.format('MMMM').toUpperCase()} DEL ${minDate.format('YYYY')}`;
            } else if (!sameMonth && sameYear) {
                text = `${formatDay(minDate)} DE ${minDate.format('MMMM').toUpperCase()} AL ${formatDay(maxDate)} DE ${maxDate.format('MMMM').toUpperCase()} DEL ${minDate.format('YYYY')}`;
            } else {
                text = `${formatFull(minDate)} AL ${formatFull(maxDate)}`;
            }
        }

        // Calcular fecha siguiente a la mayor
        let nextDate = maxDate.add(1, 'day');
        // Si es domingo (0), avanzar a lunes (día 1)
        if (nextDate.day() === 0) {
            nextDate = nextDate.add(1, 'day');
        }

        return {
            text,
            nextDate: nextDate
        };
    }

    private validateHolidayDays(days: string[]) {
        const dates = days.map(date => dayjs(date));

        const hasInvalidDate = dates.some(date => !date.isValid());

        if (hasInvalidDate) throw new CustomError('Se recibió una fecha inválida.', 400);

        const uniqueDates = new Set(
            dates.map(date => date.format('YYYY-MM-DD'))
        );

        if (uniqueDates.size !== dates.length) throw new CustomError('No se pueden repetir días en la solicitud.', 400);

        const hasSunday = dates.some(date => date.day() === 0);

        if (hasSunday) throw new CustomError('Las vacaciones no pueden incluir domingos.', 400);


        const sortedDates = [...dates].sort(
            (a, b) => a.valueOf() - b.valueOf()
        );

        for (let i = 0; i < sortedDates.length - 1; i++) {
            const current = sortedDates[i];
            const next = sortedDates[i + 1];

            const expectedNext = current.day() === 6
                ? current.add(2, 'day')
                : current.add(1, 'day');

            if (!expectedNext.isSame(next, 'day')) {
                throw new CustomError(
                    `Los días de vacaciones deben ser consecutivos. Existe un salto entre ${current.format('YYYY-MM-DD')} y ${next.format('YYYY-MM-DD')}.`, 400
                );
            }
        }
        return sortedDates;
    }

}