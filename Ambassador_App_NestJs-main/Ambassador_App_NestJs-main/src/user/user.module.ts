import { CacheModule, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), JwtModule.register({ secret: 'JWT_SECRET'}), ],
  controllers: [UserController],
  providers: [UserService, RedisService],
  exports: [UserService]
})
export class UserModule {}
