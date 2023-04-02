import { LinkEntity } from "src/link/entities/link.entity";
import { OrderEntity, OrderItemsEntity } from "src/order/entities/order.entity";
import { ProductEntity } from "src/product/entities/product.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { DataSourceOptions, DataSource } from "typeorm";

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: 'db',
    port: 5432,
    username: 'sadok',
    password: 'azerty',
    database: 'nest',
    entities: [UserEntity, ProductEntity, OrderEntity, OrderItemsEntity, LinkEntity],
    synchronize: true,
  };

  const dataSource = new DataSource(dataSourceOptions);

  export default dataSource;