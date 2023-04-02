import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { LinkEntity } from 'src/link/entities/link.entity';
import { ProductEntity } from 'src/product/entities/product.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderEntity, OrderItemsEntity } from './entities/order.entity';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrderService {

  constructor(@InjectRepository(OrderEntity) private readonly orderRepository: Repository<OrderEntity>,
              @InjectRepository(OrderItemsEntity) private readonly orderItemRepository: Repository<OrderItemsEntity>,
              @InjectRepository(LinkEntity) private readonly linkRepository: Repository<LinkEntity>,
              @InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,
              @InjectStripe() private readonly stripeClient: Stripe,
              private configService: ConfigService,
              private dataSource: DataSource,
              private eventEmitter: EventEmitter2){}

  async addOrder(options: any){
    return await this.orderRepository.save(options);
  }

  async addOrderItems(options: any){
    return await this.orderItemRepository.save(options);
  }

  async create(createOrderDto: CreateOrderDto) {
    const link: LinkEntity = await this.linkRepository.findOne({
     where: { code: createOrderDto.code },
      relations: ['user']
  });

  if (!link) {
      throw new BadRequestException('Invalid link!');
  }

  const queryRunner = this.dataSource.createQueryRunner();

  try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const o = new OrderEntity();
      o.user_id = link.user.id;
      o.ambassador_email = link.user.email;
      o.firstname = createOrderDto.first_name;
      o.lastname = createOrderDto.last_name;
      o.email = createOrderDto.email;
      o.address = createOrderDto.address;
      o.country = createOrderDto.country;
      o.city = createOrderDto.city;
      o.zip = createOrderDto.zip;
      o.code = createOrderDto.code;

      const order = await queryRunner.manager.save(o);

      let line_items = [];

      for (let p of createOrderDto.products) {
          const product: ProductEntity = await this.productRepository.findOne({
            where: {id: p.product_id}
          });

          const orderItem = new OrderItemsEntity();
          orderItem.order = order;
          orderItem.product_title = product.title;
          orderItem.price = product.price;
          orderItem.quantity = p.quantity;
          orderItem.ambassador_revenue = (0.1 * product.price * p.quantity).toString();
          orderItem.admin_revenue = (0.9 * product.price * p.quantity).toString();

          await queryRunner.manager.save(orderItem);

          line_items.push({
              // name: product.title,
              // description: product.description,
              // images: [
              //     product.image
              // ],
              // amount: 100 * product.price,
              // currency: 'usd',
              // quantity: p.quantity
              price_data: {
                currency: 'usd',
                product_data: {
                  name: product.title,
                },
                unit_amount: 100 * product.price,
              },
              quantity: p.quantity
          })
      }

      const source = await this.stripeClient.checkout.sessions.create({
        mode: 'payment',
          payment_method_types: ['card'],
          line_items,
          success_url: `${this.configService.get('CHECKOUT_URL')}/success?source={CHECKOUT_SESSION_ID}`,
          cancel_url: `${this.configService.get('CHECKOUT_URL')}/error`
      });

      order.transaction_id = source['id'];
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      return source;
  } catch (e) {
      await queryRunner.rollbackTransaction();

      throw new BadRequestException(e.message);
  } finally {
      await queryRunner.release();
  }
  }

  async allOrders() {
    return await this.orderRepository.find({
      relations: ['orderItems']
    });
  }

    async confirm(source: string) {
        const order = await this.orderRepository.findOne({
            where: {transaction_id: source},
            relations: ['user', 'orderItems']
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        await this.orderRepository.update(order.id, {complete: true});

        await this.eventEmitter.emit('order.completed', order);

        return {
            message: 'success'
        }
    }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
