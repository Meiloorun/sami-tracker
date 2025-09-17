import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("feedings")
export class Feeding{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    date_time!: Date; 

    @Column()
    notes!: string;
}