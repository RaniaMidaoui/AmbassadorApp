import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Exclude, Expose } from 'class-transformer';
import { OrderEntity } from "src/order/entities/order.entity";

@Entity({ name: 'users'})
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    email: string;

    @Exclude()
    @Column()
    password: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({default: false})
    isAmbassador: boolean;

    @OneToMany(() => OrderEntity, order => order.user, {
        createForeignKeyConstraints: false
    })
    orders: OrderEntity[];

    get name(){
        return `${this.firstname} ${this.lastname}`;
    }

    get revenue(){
        return this.orders.filter(o => o.complete).reduce((s, i) => s + i.ambassador_revenue, 0);
    }
}
