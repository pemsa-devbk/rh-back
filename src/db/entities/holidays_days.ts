import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { HolidayRequest } from "./holidays_request";

@Entity({ name: 'holidays_days' })
export class HolidayDays {
    @PrimaryGeneratedColumn('increment')
    holidays_days_id: number;

    @Column({ type: 'date' })
    date: Date;

    @Column()
    request_holiday_id: number;

    @ManyToOne(
        () => HolidayRequest,
        (holidayRequest) => holidayRequest.days,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'request_holiday_id' })
    holidayRequest: HolidayRequest;
}