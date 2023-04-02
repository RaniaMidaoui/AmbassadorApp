import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { Request } from 'express';

@Injectable()
export class ProductService {
  constructor(@InjectRepository(ProductEntity) private productRepository: Repository<ProductEntity>,
              @Inject(CACHE_MANAGER) private cacheManager: Cache,
              private eventEmitter: EventEmitter2){}

  async createProduct(createProductDto: CreateProductDto) {
    const product = await this.productRepository.save(createProductDto);
    this.eventEmitter.emit('products_updated');
    return product;
  }

  async allProducts() {
    return await this.productRepository.find();
  }

  async getProduct(id: number) {

    return await this.productRepository.findOne({
      where: { id}
    });

  }

  async updateProduct(id: number, updateProductDto: UpdateProductDto) {

    await this.productRepository.update(id, updateProductDto);
    this.eventEmitter.emit('products_updated');

    return await this.productRepository.findOne({
      where: { id}
    });

  }

  async deleteProduct(id: number) {

    this.eventEmitter.emit('products_updated');
    return this.productRepository.delete(id);
    
  }

  async frontend(){
    return this.productRepository.find();
  }

  async backend(req: Request){
    
    let products: ProductEntity[] = await this.cacheManager.get('products_backend');

    if(!products){
      products = await this.productRepository.find();
      await this.cacheManager.set('products_backend', products, 1800);
    }

    if(req.query.s){
      const s = req.query.s.toString().toLowerCase();
      products = products.filter(p => p.title.toLowerCase().indexOf(s) >= 0 || p.description.toLowerCase().indexOf(s) >= 0);
    }

    if(req.query.sort){
      products.sort((a, b) => {
        const diff = a.price - b.price;
        if(diff === 0) return 0;
        return req.query.sort === 'asc' ? Math.abs(diff) / diff : -(Math.abs(diff) / diff);
      })
    }

    if(req.query.page){
      const page: number = parseInt(req.query.page.toString()) || 1;
      const perPage = 9;
      const data = products.slice((page - 1) * perPage, page * perPage);

      return {
        data,
        total: products.length,
        page,
        lastPage: Math.ceil( products.length / perPage)
      }

    }

    return products;
  }
}
