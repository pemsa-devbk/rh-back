import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Area } from "./area.entity";
import { User } from "./user.entity";

@Entity({name: 'positions'})
export class Position{
    @PrimaryGeneratedColumn('increment')
    position_id: number;

    @Column({type: 'varchar', length: 100})
    name: string;

    @Column()
    area_id: number;

    @ManyToOne(
        () => Area,
        (area) => area.positions,
        {onDelete: 'CASCADE'}
    )
    @JoinColumn({name: 'area_id'})
    area: Area;


    @OneToMany(
        () => User,
        (user) => user.position
    )
    users: User[];

}