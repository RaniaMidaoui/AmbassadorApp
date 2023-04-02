import { OrderEntity } from "src/order/entities/order.entity";
import { ProductEntity } from "src/product/entities/product.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'links'})
export class LinkEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true})
    code: string;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_id'})
    user: UserEntity;

    @ManyToMany(() => ProductEntity)
    @JoinTable({
        name: 'link_products',
        joinColumn: { name: 'link_id', referencedColumnName: 'id'},
        inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id'}
    })
    products: ProductEntity[];

    @OneToMany(() => OrderEntity, order => order.link, {
        //make the relation in nest js but not in the database
        createForeignKeyConstraints: false
    })
    @JoinColumn({
        name: 'code',
        referencedColumnName: 'code'
    })
    orders: OrderEntity[];
}
