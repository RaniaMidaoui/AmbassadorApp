import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'products'})
export class ProductEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ default: ''})
    description: string;

    @Column({ default: ''})
    image: string;

    @Column()
    price: number;
}
