import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Position } from "./position.entity";
import { Department } from "./department.entity";

@Entity({name: 'areas'})
export class Area {
    @PrimaryGeneratedColumn('increment')
    area_id: number;

    @Column({
        type: 'varchar', length: 100
    })
    name: string;

    @Column({ nullable: true, type: 'varchar', length: 5 })
    responsible_user_id: string;

    @Column({ nullable: true })
    department_id: number;

    // * Relations
    @ManyToOne(
        () => Department,
        (department) => department.areas,
        {onDelete: 'CASCADE'}
    )
    @JoinColumn({ name: 'department_id' })
    deparment: Department;

    @ManyToOne(
        () => User,
        (user) => user.areasInCharge,
        { onDelete: 'SET NULL' }
    )
    @JoinColumn({ name: 'responsible_user_id' })
    responsibleUser: User;

    @OneToMany(
        () => Position,
        (position) => position.area
    )
    positions: Position[];
}