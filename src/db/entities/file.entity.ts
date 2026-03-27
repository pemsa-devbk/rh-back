import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EmployeeFiles } from "./employee_files.entity";

@Entity({name: 'files'})
export class File{
    @PrimaryGeneratedColumn('increment')
    file_id: number;

    @Column({type: 'varchar', length: 100})
    name: string;

    @Column({type: 'varchar', length: 10, unique: true})
    key: string;

    @Column({type: 'varchar', length: 150})
    valid_mime_types: string;

    @Column({ type: 'decimal', precision: 2 })
    max_size: number;

    @Column({type: 'bit', default: 0})
    is_required: boolean;

    @Column({type: 'varchar', length: 255, nullable: true})
    description: string;

    @Column({type: 'bit', default: 1})
    is_active: boolean;

    @Column({type: 'bit', default: 1})
    can_removed: boolean;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(
        () => EmployeeFiles,
        (employeeFiles) => employeeFiles.file
    )
    employeeFiles: EmployeeFiles[];

}