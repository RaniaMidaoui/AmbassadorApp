import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule} from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from './db/data-source';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { LinkModule } from './link/link.module';
import * as redisStore from 'cache-manager-redis-store';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions),
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  EventEmitterModule.forRoot(),
  CacheModule.register({
    isGlobal: true,
    store: redisStore,
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }),
  UserModule,
  ProductModule,
  OrderModule,
  LinkModule,
  RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
