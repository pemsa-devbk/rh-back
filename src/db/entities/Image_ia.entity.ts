import { Column, CreateDateColumn, Entity } from "typeorm";

@Entity({ name: 'image_ia' })
export class ImageIA {

    @Column({primary: true, type: 'varchar', length: 40})
    image_id: string;

    @Column({type: 'varchar'})
    description: string;

    @Column({type: 'tinyint'})
    status: number; 

    @CreateDateColumn()
    created_at: Date;
}