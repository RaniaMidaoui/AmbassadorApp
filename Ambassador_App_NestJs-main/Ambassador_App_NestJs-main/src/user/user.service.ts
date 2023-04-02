import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>, private readonly jwtService: JwtService, private redisService: RedisService){}

  async signToken(user: UserEntity, req: Request){
    const adminLogin = (req.path === '/api/admin/login');

    if(user.isAmbassador && adminLogin){
      throw new UnauthorizedException();
    }

    const payload = {
      sub: user.id,
      email: user.email,
      scope: adminLogin ? 'admin' : 'ambassador'
    };
    return await this.jwtService.signAsync(payload);
  }

  async getUserFromToken(req: Request){
    const cookie = req.cookies['jwt-token'];
    const userPayload = await this.jwtService.verifyAsync(cookie);

    return await this.userRepository.findOne({
      where: {
        email: userPayload.email
      }
    });

  }

  async save(options: Omit<CreateUserDto, 'password_confirmation'>){
    return this.userRepository.save(options);
  }

  async register(createUserDto: CreateUserDto) {
    if(createUserDto.password !== createUserDto.password_confirmation){
      throw new BadRequestException('Password does not match');
    }
    delete createUserDto.password_confirmation;
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    try{
      return await this.userRepository.save({
        ...createUserDto
      });
    }catch(err){
      if(err.code === '23505'){
        throw new BadRequestException('This email already in use');
      }
    }
  }

  async Login(email: string, password: string,req: Request, res: Response) {
    const user = await this.userRepository.findOne({
      where: {
        email
      }
    });
    if(!user){
      throw new BadRequestException('invalid email or password');
    }
    else if(!await bcrypt.compare(password, user.password)){
      throw new BadRequestException('invalid email or password');
    }
    const jwt = this.signToken(user, req);
    res.cookie('jwt-token', (await jwt).toString(), { httpOnly: true});
    return 'Login success';
  }

  async authenticatedUser(req: Request){

    let user = await this.getUserFromToken(req);

    if(req.path === '/api/admin/user'){
      return user;
    }

    user = await this.userRepository.findOne({
      where: {
        email: user.email
      },
      relations: ['orders', 'orders.orderItems']
    });

    const { orders, password, ...data} = user;

    return {
      ...data,
      revenue: user.revenue,
    };
  }

  async logout(res: Response){
    res.clearCookie('jwt-token');
    return 'logout successfully';
  }

  async updateInfo(req: Request, updateUserDto: UpdateUserDto) {
    const cookie = req.cookies['jwt-token'];
    const userPayload = await this.jwtService.verifyAsync(cookie);
    await this.userRepository.update(userPayload.sub, updateUserDto);

    return await this.userRepository.findOne({
      where: { id: userPayload.sub }
    });
  }

  async updatePassword(req: Request, password: string, password_confirmation: string) {
    if(password !== password_confirmation){
      throw new BadRequestException('Password does not match');
    }
    
    const cookie = req.cookies['jwt-token'];
    const userPayload = await this.jwtService.verifyAsync(cookie);
    password = await bcrypt.hash(password, 10)
    await this.userRepository.update(userPayload.sub, {
      password
    });

    return await this.userRepository.findOne({
      where: { id: userPayload.sub }
    });
  }

  async getAllAmb(){
    const ambassadors = await this.userRepository.find({
      where: {
        isAmbassador: true
      }
    });

    return ambassadors;
  }

  async getAmbwithOrders(){
    return await this.userRepository.find({
      where: {
        isAmbassador: true
      },
      relations: ['orders', 'orders.orderItems']
    });
  }

  async rankings(res: Response){
    const client = this.redisService.getClient();
    client.zrevrangebyscore('rankings', '+inf', '-inf', 'withscores', (err, result) => {
      let name;
      res.send(result.reduce((o, r) => {
        if(isNaN(parseFloat(r))){
          name = r;
          // return {
          //   ...o,
          //   [r]: score
          // }
          return o;
        }
        else {
          // score = parseFloat(r);
          // return o;
          return {
            ...o,
            [name]: parseFloat(r)
          }
        }
      }, {}));
    })
  }
}
