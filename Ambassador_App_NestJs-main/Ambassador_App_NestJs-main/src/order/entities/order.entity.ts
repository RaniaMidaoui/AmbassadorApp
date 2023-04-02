import { Exclude, Expose } from "class-transformer";
import { LinkEntity } from "src/link/entities/link.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'orders'})
export class OrderEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true})
    transaction_id: string;

    @Column()
    user_id: number;

    @Column()
    code: string;

    @Column()
    ambassador_email: string;

    @Exclude()
    @Column()
    firstname: string;
    
    @Exclude()
    @Column()
    lastname: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    zip: string;

    @Exclude()
    @Column({ default: false })
    complete: boolean;

    @ManyToOne(() => UserEntity, user => user.orders, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({name: 'user_id' })
    user: UserEntity;

    @ManyToOne(() => LinkEntity, link => link.orders, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({
        name: 'code',
        referencedColumnName: 'code'
    })
    link: LinkEntity;

    @OneToMany(() => OrderItemsEntity, orderItem => orderItem.order)
    orderItems: OrderItemsEntity[];

    @Expose()
    get name(){
        return `${this.firstname} ${this.lastname}`
    }

    @Expose()
    get total(){
        return this.orderItems.reduce((s, i) => s + parseFloat(i.admin_revenue), 0);
    }

    get ambassador_revenue(){
        return this.orderItems.reduce((s, i) => s + parseFloat(i.ambassador_revenue), 0);
    }

}

@Entity({ name: 'order_items'})
export class OrderItemsEntity{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    product_title: string;

    @Column()
    price: number;

    @Column()
    quantity: number;

    @Column({ type: 'real' })
    admin_revenue: string;

    @Column({ type: 'real' })
    ambassador_revenue: string;

    @ManyToOne(() => OrderEntity, order => order.orderItems)
    @JoinColumn({ name: 'order_id'})
    order: OrderEntity;
}
