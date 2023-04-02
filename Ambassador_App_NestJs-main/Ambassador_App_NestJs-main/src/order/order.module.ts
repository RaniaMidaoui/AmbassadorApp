import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity, OrderItemsEntity } from './entities/order.entity';
import { JwtModule } from '@nestjs/jwt';
import { OrderListener } from './listeners/order.listeners';
import { RedisService } from 'src/redis/redis.service';
import { StripeModule } from 'nestjs-stripe';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { LinkEntity } from 'src/link/entities/link.entity';
import { ProductEntity } from 'src/product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemsEntity, LinkEntity, ProductEntity]), 
            JwtModule.register({ secret: 'JWT_SECRET'}),
            StripeModule.forRootAsync({
              inject: [ConfigService],
              useFactory: (configService: ConfigService) => ({
                  apiKey: configService.get('STRIPE_KEY'),
                  apiVersion: '2022-11-15',
              })
          }),
          MailerModule.forRoot({
              transport: {
                  host: 'mailhog',
                  port: 1025
              },
              defaults: {
                  from: 'no-reply@example.com'
              }
          })],
  controllers: [OrderController],
  providers: [OrderService, OrderListener, RedisService]
})
export class OrderModule {}
