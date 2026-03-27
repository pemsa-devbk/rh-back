import { appDataSource } from "../db/dataBase";
import { User } from "../db/entities/user.entity";
import dayjs from '../utils/dayjs';
import { HolidaysConfig } from "../db/entities/holidays_config";
import { HolidayRequest } from '../db/entities/holidays_request';
import { StatusHoliday } from "../types/enums/status_holidays";
import { StatusUser } from "../types/enums/status_user";
import { CronJob } from 'cron'
import { EmailService } from "./Email.service";
import { Employee } from "../db/entities/employee.entity";


export class TaskService {
    private cronBirthDay: CronJob;
    private cronContractDay: CronJob;
    private cronHolidays: CronJob;

    constructor(
        private readonly userRepository = appDataSource.getRepository(User),
        private readonly holidayConfigRepository = appDataSource.getRepository(HolidaysConfig),
        private readonly holidayRequestRepository = appDataSource.getRepository(HolidayRequest),
        private readonly emailService = new EmailService(),
    ) { }

    public StartTask() {
        // this.cronBirthDay = new CronJob(
        //     '33 14 * * *', // '25 14 * * *'
        //     async () => {
        //         await this.checkBirthdayUsers();
        //     },
        //     null, true
        // );
        // this.cronContractDay = new CronJob(
        //     '0 0 * * *',
        //     async () => {
        //         await this.checkContractAnniversaries();
        //     },
        //     null, true
        // );
        // this.cronHolidays = new CronJob(
        //     '00 08 * * *', // '25 14 * * *'
        //     async () => {
        //         await this.checkHolidays();
        //     },
        //     null, true
        // );
        // new CronJob(
        //     '* * * * *', async() => {
        //         const rp = await fetch('https://www.facebook.com/michel.rodriguez.987583/posts/pfbid0GnCBg5kWUDtTxj8HmMs4eCA1o5EHDDvK4W4shH8DWuK3RgRarVd7ugxJKp5vjJnyl');

        //         console.log(rp);
                
                
        //     }
        // )
    }

    public async checkBirthdayUsers() {
        try {

            const today = dayjs.tz().format('MM-DD');
            const [month, day] = today.split('-').map(Number);
            const birthdayUsers = await this.userRepository.createQueryBuilder("usuario")
                .where('MONTH(usuario.birthdate) = :month', { month })
                .andWhere('DAY(usuario.birthdate) = :day', { day })
                .getMany();

            await this.emailService.sendBirthDaymail(birthdayUsers);

        } catch (error) {
            console.log(error);
        }
        // TODO mandar correo
    }

    public async checkContractAnniversaries() {
        const today = dayjs.tz().format('MM-DD');
        const [month, day] = today.split('-').map(Number);
        const anniversaryUsers = await this.userRepository.createQueryBuilder("usuario")
            .where('MONTH(usuario.contract_date) = :month', { month })
            .andWhere('DAY(usuario.contract_date) = :day', { day })
            .getMany();
        const holidayConfig = await this.holidayConfigRepository.find();

        const updateUsers = anniversaryUsers.map(user => {
            const today = dayjs.tz();
            const contractUserDate = dayjs.tz(); // dayjs.tz(user.contract_date)
            const diff = today.diff(contractUserDate, 'year');
            const daysToIncrement = holidayConfig.find(config => diff >= config.min_year && diff <= config.max_year).number_days || 0;
            return {
                ...user,
                // vacationDays: user.vacation_days + daysToIncrement
            }
        });

        await this.userRepository.save(updateUsers);
    }

    public async checkHolidays() {
        const today = dayjs.tz();

        const holidaysActive = await this.holidayRequestRepository.find({ where: [{ status: StatusHoliday.pendiente }, { status: StatusHoliday.curso }], relations: { days: true, employee: {user: true} } });

        const users: Array<Employee> = [];
        const holidays: Array<HolidayRequest> = [];
        holidaysActive.forEach(holiday => {
            const sortedDates = holiday.days.map(d => dayjs.tz(d.date)).sort((a, b) => a.valueOf() - b.valueOf());
            const minDate = sortedDates[0];
            const maxDate = sortedDates[sortedDates.length - 1];
            if (today.isSame(minDate, 'date') || (today.isAfter(minDate, 'date') && today.isBefore(maxDate.add(1, 'day'), 'date'))) {
                holiday.status = StatusHoliday.curso;
                holidays.push(holiday);
                holiday.employee.status = StatusUser.vacaciones;
                users.push(holiday.employee);
            } else if (today.isSame(maxDate.add(1, 'day'), 'date') || today.isAfter(maxDate.add(1, 'day'), 'date')) {
                holiday.status = StatusHoliday.finalizada;
                holidays.push(holiday);
                holiday.employee.status = StatusUser.activo;
                users.push(holiday.employee);
            }
        });

        const queryRunner = appDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            await queryRunner.manager.save<Employee>(users);
            await queryRunner.manager.save<HolidayRequest>(holidays);
            await queryRunner.commitTransaction();
        } catch (error) {
            console.log(error);

            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release()
        }
    }
}