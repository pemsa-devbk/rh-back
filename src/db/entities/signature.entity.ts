import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Enterprise } from "./enterprise.entity";

@Entity({name: 'signatures'})
export class Signature {
    @PrimaryGeneratedColumn('uuid')
    signature_id: string;

    @Column({
        type: 'varchar',
        length: 400
    })
    url_logo: string;

    @Column({
        type: 'varchar',
        length: 400
    })
    background: string;

    @Column({
        type: 'varchar',
        length: 10
    })
    color_text: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true
    })
    extra_text: string;

    @Column({
        type: 'varchar',
        length: 10,
        nullable: true
    })
    color_extra: string;

    @Column({
        type: 'varchar',
        length: 200
    })
    text_first_section: string;

    @Column({
        type: 'varchar',
        length: 10,
        nullable: true
    })
    first_color_first_section: string;

    @Column({
        type: 'varchar',
        length: 10,
        nullable: true
    })
    second_color_first_section: string;

    @Column({
        type: 'text',
    })
    text_second_section: string;

    @Column({
        type: 'text',
    })
    text_third_section: string;

    @Column({
        type: 'varchar',
        length: 10,
        nullable: true
    })
    first_color_third_section: string;

    @Column({
        type: 'varchar',
        length: 10,
        nullable: true
    })
    second_color_third_section: string;

    @Column({
        type: 'varchar',
        length: 10,
        nullable: true
    })
    vertical_text: string;

    @Column({
        type: 'varchar',
        length: 10,
        nullable: true
    })
    color_vertical_text: string;

    @Column({ nullable: true })
    enterprise_id: string;

    @OneToOne(
        () => Enterprise,
        (enterprise) => enterprise.signature
    )
    @JoinColumn({ name: 'enterprise_id' })
    enterprise: Enterprise;

}