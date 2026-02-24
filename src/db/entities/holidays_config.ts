import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({ name: 'holidays_config' })
export class HolidaysConfig {
    @PrimaryGeneratedColumn('increment')
    holiday_config_id: number;

    @Column({ type: 'tinyint' })
    min_year: number;

    @Column({ type: 'tinyint' })
    max_year: number;

    @Column({ type: 'tinyint', })
    number_days: number;
}