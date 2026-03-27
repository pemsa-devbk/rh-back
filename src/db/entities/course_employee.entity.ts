import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Course } from "./course.entity";
import { Employee } from "./employee.entity";

@Entity({name: 'course_employee'})
export class CourseEmployee{
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
        () => Employee,
        (employee) => employee,
        {onDelete: 'CASCADE'}
    )
    @JoinColumn({name: 'user_id'})
    employee: Employee;
}