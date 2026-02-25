import { appDataSource } from "../db/dataBase";
import { HolidayRequest } from "../db/entities/holidays_request";
import { User } from "../db/entities/user.entity";
import { CreateRequestHolidaysDto } from "../Dto/holidays/create_request.dto";
import { StatusHoliday } from "../types/enums/status_holidays";
import dayjs from '../utils/dayjs'
import { HolidayDays } from '../db/entities/holidays_days';
import { Binnacle } from "../db/entities/binnacle.entity";
import { ValidStateMov } from "../types/enums/validMov";
import { join } from 'path';
import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import jsPDF from "jspdf";
import { SystemConfiguration } from "../db/entities/system_configuration";
import { HolidaysConfig } from "../db/entities/holidays_config";
import { PaginationDto } from "../Dto/pagination.dto";
import { StatusUser } from "../types/enums/status_user";
import { Between, EntityManager } from "typeorm";
import { Position } from "../db/entities/position.entity";
import { Employee } from "../db/entities/employee";

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
 * 1. Al momento de crear las vacaciones se quitan los días del usuario?
 * 2. Se pueden cancelar todas las vacaciones excepto si ya fue cancelado
 * 3. Verificar documento de creación
 */
export class HolidayService {

    constructor(
        private readonly holidayRequestRepository = appDataSource.getRepository(HolidayRequest),
        private readonly holidayConfigRepository = appDataSource.getRepository(HolidaysConfig)
    ) { }

    public async create(user_id: string, modifier_id: string, createDto: CreateRequestHolidaysDto) {
        const { days, comment } = createDto;
        const today = dayjs.tz();
        return await this.holidayRequestRepository.manager.transaction(async (transactionalEntityManager) => {
            const employee = await transactionalEntityManager.findOne(Employee, { where: { user_id }, relations: { position: true, boss: true, user: true } });
            if (!employee) throw 'Usuario no encontrado';
            // * Validar que no existan vacaciones cruzadas
            const sortedDates = days.map(d => dayjs.tz(d)).sort((a, b) => a.valueOf() - b.valueOf());
            const maxDate = sortedDates[sortedDates.length - 1];
            const crossHoliday = await transactionalEntityManager.findOne(HolidayRequest, {
                where: { user_id, days: { date: Between(sortedDates[0].toDate(), maxDate.toDate()) } }
            });
            if (crossHoliday) throw 'Ya existe un registro de vacaciones entre las fechas solicitadas';

            let status = StatusHoliday.pendiente;
            // * Registro de vacaciones que ya pasaron
            if (today.isAfter(maxDate, 'date') || today.isSame(maxDate.add(1, 'day'), 'date')) status = StatusHoliday.finalizada;
            // if (today.isSame(maxDate.add(1, 'day'), 'date') || today.isAfter(maxDate.add(1, 'day'), 'date'))  // * Son vacaciones anteriores, es decir ya han pasado
            //     status = StatusHoliday.finalizada;
            // * Crear solicitud
            await transactionalEntityManager.update(Employee, { user_id }, { vacation_days: (employee.vacation_days - days.length) })
            const holydayRequest = transactionalEntityManager.create(HolidayRequest, {
                user_id,
                status,
                comment
            });
            await transactionalEntityManager.insert(HolidayRequest, holydayRequest);

            // * Días de vacaciones
            const daysRequest = transactionalEntityManager.create(HolidayDays, days.map(day => ({
                date: day,
                request_holiday_id: holydayRequest.request_holiday_id
            })));
            await transactionalEntityManager.insert(HolidayDays, daysRequest);
            // * Bitacora
            await transactionalEntityManager.insert(Binnacle, { modifier_user_id: modifier_id, modifiedUser: employee, type: ValidStateMov.vacaciones });

            holydayRequest.days = daysRequest;
            // * Crear documento
            await this.createDoc(transactionalEntityManager, holydayRequest, employee);
            const othersText = this.formatVacationDates(daysRequest);
            return {
                message: `Solicitud de vacaciones creada para la(s) fecha(s) ${othersText.text} del empleado ${employee.user.name}`,
                id: holydayRequest.request_holiday_id
            };
        })
    }

    public async getHolidaybyEmployee(user_id: string, pagination: PaginationDto) {
        const { skip, take } = pagination;
        const [data, total] = await this.holidayRequestRepository.createQueryBuilder('holiday')
            .leftJoin('holiday.days', 'days')
            .addSelect(['days.date', 'days.holidays_days_id'])
            .where('holiday.user_id = :user_id', { user_id })
            .take(take).skip(skip).getManyAndCount();
        return [
            data.map(holiday => ({
                ...holiday,
                others: this.formatVacationDates(holiday.days)
            })), total
        ];
    }

    public async cancel(user_id: string, request_holiday_id: number) {
        return this.holidayRequestRepository.manager.transaction(async (transactionalEntityManager) => {
            const holiday = await transactionalEntityManager.findOne(HolidayRequest, { where: { user_id, request_holiday_id }, relations: { days: true, employee: { user: true} } });
            if (!holiday) throw 'No hay registro de vacaciones';
            if (holiday.status === StatusHoliday.cancelado) throw "El registro ya ha sido cancelado";
            await transactionalEntityManager.update(Employee, { user_id: holiday.user_id }, { vacation_days: (holiday.employee.vacation_days + holiday.days.length), status: StatusUser.activo });
            await transactionalEntityManager.update(HolidayRequest, { request_holiday_id }, { status: StatusHoliday.cancelado });
            const othersText = this.formatVacationDates(holiday.days);
            return `Se cancelo la solicitud de vacaciones del usuario ${holiday.employee.user.name} para la(s) fecha(s) ${othersText.text}`;
        });
    }

    public async getFormatHoliday(user_id: string, request_holiday_id: number): Promise<[string, Buffer]> {

        const holiday = await this.holidayRequestRepository.findOne({ where: { request_holiday_id, user_id }, relations: { employee: {user: true}, days: true } })
        if (!holiday) throw 'No hay registro de vacaciones';
        const pathFile = join(__dirname, "..", "..", "uploads/users", user_id, "holidays", `${holiday.request_holiday_id}.pdf`);
        if (!existsSync(pathFile)) throw "Archivo no existente";
        const othersText = this.formatVacationDates(holiday.days);
        return [`${holiday.employee.user.name} ${othersText.text}.pdf`, readFileSync(pathFile)];
    }

    public async uploadFormat(user_id: string, request_holiday_id: number, file: Express.Multer.File) {
        return this.holidayRequestRepository.manager.transaction(async (transactionalEntityManager) => {
            const holiday = await transactionalEntityManager.findOne(HolidayRequest, { where: { request_holiday_id, user_id } });
            if (!holiday) throw 'No existe registro de vacaciones';
            const pathFile = join(__dirname, "..", "..", "uploads/users", user_id, "holidays");
            if (!existsSync(pathFile)) throw "Directorio no existente comuniquese con el administrador";
            const fileToDelete = join(pathFile, `${request_holiday_id}.pdf`);
            if (existsSync(fileToDelete)) rmSync(fileToDelete);
            const validaExten = file.originalname.split('.');
            const extenArch = validaExten.pop();
            await transactionalEntityManager.update(HolidayRequest, { request_holiday_id, user_id }, { have_format: true });
            writeFileSync(join(pathFile, `${request_holiday_id}.${extenArch}`), file.buffer);
            return 'Fomato actualizado';
        });
    }

    private async createDoc(transactionalEntityManager: EntityManager, holiday: HolidayRequest, employee: Employee) {

        const system = await transactionalEntityManager.find(SystemConfiguration, { relations: { employee: {user: true} } })
        const position = await transactionalEntityManager.findOne(Position, { where: { position_id: employee.position_id }, relations: { area: { responsibleUser: {user: true} } } });
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

        return doc.save(`${path}/${holiday.request_holiday_id}.pdf`);
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
}