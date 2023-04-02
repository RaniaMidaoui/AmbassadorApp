import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { UpdateLinkDto } from './dto/update-link.dto';
import { LinkEntity } from './entities/link.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class LinkService {
  constructor(@InjectRepository(LinkEntity) private readonly linkRepository: Repository<LinkEntity>,
              @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
              private readonly userService: UserService){}

  async create(req: Request, products: number[]) {
    const user = await this.userService.getUserFromToken(req);
    return await this.linkRepository.save({
      code: Math.random().toString(36).substring(6),
      user,
      products: products.map(id => ({ id }))
    })
  }

  async stats(req: Request){
    const user = await this.userService.getUserFromToken(req);

    const links = await this.linkRepository.find({
      where: {
        user
      },
      relations: ['orders']
    });

    return links.map(link => {
      const completedOrders = link.orders.filter( order => order.complete === true);

      return {
        code: link.code,
        count: completedOrders.length,
        revenue: completedOrders.reduce((s, o) => 
        { 
          return s + o.ambassador_revenue
        }
        , 0)
      }
    })
  }

  async findByUser(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id
      }
    });

    return await this.linkRepository.find({
      where: {
        user
      },
      relations: ['orders']
    })
  }

    async linkCheckout(code: string) {
        return this.linkRepository.findOne({
            where: {code},
            relations: ['user', 'products']
        })
    }

  update(id: number, updateLinkDto: UpdateLinkDto) {
    return `This action updates a #${id} link`;
  }

  remove(id: number) {
    return `This action removes a #${id} link`;
  }
}
