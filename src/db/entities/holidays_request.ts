import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { HolidayDays } from "./holidays_days";

@Entity({name: 'holidays_request'})
export class HolidayRequest {
    @PrimaryGeneratedColumn('increment')
    request_holiday_id: number;

    @Column({nullable: true, type: 'varchar', length: 150})
    comment: string;

    @Column({type: 'tinyint'})
    status: number;

    @Column({ type: 'bit', default: false })
    have_format: boolean;

    @CreateDateColumn()
    created_at: Date;

    @Column({ type: 'varchar', length: 5 })
    user_id: string;

    // * relations
    @OneToMany(
        () => HolidayDays,
        (holidayDays) => holidayDays.holidayRequest
    )
    days: HolidayDays[];

    @ManyToOne(
        () => User,
        (user) => user.holidays,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'user_id' })
    user: User;

}