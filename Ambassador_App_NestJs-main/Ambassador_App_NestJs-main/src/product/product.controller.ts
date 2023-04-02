import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, CacheKey, CacheTTL, CacheInterceptor, UseInterceptors, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { Request } from 'express';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AuthGuard)
  @Post('admin/products')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @UseGuards(AuthGuard)
  @Get('admin/products')
  allProducts() {
    return this.productService.allProducts();
  }

  @UseGuards(AuthGuard)
  @Get('admin/products/:id')
  getProduct(@Param('id') id: string) {
    return this.productService.getProduct(+id);
  }

  @UseGuards(AuthGuard)
  @Patch('admin/products/:id')
  updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.updateProduct(+id, updateProductDto);
  }

  @UseGuards(AuthGuard)
  @Delete('admin/products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(+id);
  }

  @CacheKey('products_frontend')
  @CacheTTL(1800)
  @UseInterceptors(CacheInterceptor)
  @Get('ambassador/products/frontend')
  frontend(){
    return this.productService.frontend();
  }

  @Get('ambassador/products/backend')
  backend(@Req() req: Request){
    return this.productService.backend(req);
  }

}
