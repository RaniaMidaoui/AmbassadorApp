import { LinkEntity } from "src/link/entities/link.entity";
import { OrderEntity, OrderItemsEntity } from "src/order/entities/order.entity";
import { ProductEntity } from "src/product/entities/product.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { DataSourceOptions, DataSource } from "typeorm";


export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST ? process.env.DB_HOST : 'localhost',
    port: process.env.DB_PORT ? +process.env.DB_PORT : 5434,
    username: process.env.DB_USER ? process.env.DB_USER : 'sadok',
    password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : 'azerty',
    database: process.env.DB_DATABASE ? process.env.DB_DATABASE : 'nest',
    entities: [UserEntity, ProductEntity, OrderEntity, OrderItemsEntity, LinkEntity],
    synchronize: true,
  };

  const dataSource = new DataSource(dataSourceOptions);

  export default dataSource;