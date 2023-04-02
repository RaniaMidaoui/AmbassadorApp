import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { JwtModule } from '@nestjs/jwt';
import { ProductListeners } from './listeners/products.listeners';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), JwtModule.register({ secret: 'JWT_SECRET'})],
  controllers: [ProductController],
  providers: [ProductService, ProductListeners]
})
export class ProductModule {}
