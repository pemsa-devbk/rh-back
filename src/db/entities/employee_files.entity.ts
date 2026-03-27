import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { File } from "./file.entity";
import { Employee } from "./employee.entity";
import { User } from "./user.entity";

@Entity({name: 'employee_files'})
@Index(['employee_id', 'file_id'], {unique: true})
export class EmployeeFiles{
    @PrimaryGeneratedColumn('increment')
    employee_file_id: number;

    @Column({ type: 'varchar', length: 5 })
    employee_id: string;

    @Column()
    file_id: number;

    @Column({ type: 'varchar', length: 5 })
    uploaded_by: string;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: 'date', nullable: true})
    expires_on: Date;

    @ManyToOne(
        () => File,
        (file) => file.employeeFiles
    )
    @JoinColumn({name: 'file_id'})
    file: File;

    @ManyToOne(
        () => Employee,
        (employee) => employee.employeeFiles
    )
    @JoinColumn({name: 'employee_id'})
    employee: Employee;

    @ManyToOne(
        () => User,
        (user) => user.uploadedFiles
    )
    @JoinColumn({name: 'uploaded_by'})
    userUploaded: User;
}