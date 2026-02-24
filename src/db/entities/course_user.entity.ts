import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Course } from "./course.entity";
import { User } from "./user.entity";

@Entity({name: 'course_users'})
export class CourseUser{
    // * Relaciones
    @PrimaryColumn()
    course_id: number;
    
    @PrimaryColumn({type: 'varchar', length: 5})
    user_id: string;

    @Column({ type: 'bit', default: false})
    have_proof: boolean;

    @ManyToOne(
        () => Course,
        (course) => course.courseUsers,
        {onDelete: 'CASCADE'}
    )
    @JoinColumn({name: 'course_id'})
    course: Course;

    @ManyToOne(
        () => User,
        (user) => user,
        {onDelete: 'CASCADE'}
    )
    @JoinColumn({name: 'user_id'})
    user: User;
}