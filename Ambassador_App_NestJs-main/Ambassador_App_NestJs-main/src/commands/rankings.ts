import { NestFactory } from "@nestjs/core"
import { AppModule } from "src/app.module"
import { UserService } from "src/user/user.service";
import { RedisService } from "src/redis/redis.service";

(async () => {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userService = app.get(UserService);
    const ambassadors = await userService.getAmbwithOrders();

    const redisService = app.get(RedisService);
    const client = redisService.getClient();
    for(let i=0; i<ambassadors.length; i++){
       await client.zadd('rankings', ambassadors[i].revenue, ambassadors[i].name);
    }

    process.exit();
})();