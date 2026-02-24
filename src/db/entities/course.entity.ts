import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CourseUser } from './course_user.entity';

@Entity({name: 'courses'})
export class Course {
    @PrimaryGeneratedColumn('increment')
    course_id: number;

    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Column({ type: 'date' })
    date_start: Date;

    @Column({ type: 'date' })
    date_end: Date;

    // * Relaciones
    @OneToMany(
        () => CourseUser,
        (courseUsers) => courseUsers.course
    )
    courseUsers: CourseUser[];
}