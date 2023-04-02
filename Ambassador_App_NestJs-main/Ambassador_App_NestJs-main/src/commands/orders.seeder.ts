import { faker } from "@faker-js/faker";
import { NestFactory } from "@nestjs/core";
import { randomInt } from "crypto";
import { AppModule } from "src/app.module";
import { OrderService } from "src/order/order.service";

(async () => {
    const app = await NestFactory.createApplicationContext(AppModule);
    const orderService = app.get(OrderService);

    for(let i=0; i<30; i++){
        const order = await orderService.addOrder({
            user_id: randomInt(2, 31),
            code: faker.lorem.slug(2),
            ambassador_email: faker.internet.email(),
            firstname: faker.name.firstName(),
            lastname: faker.name.lastName(),
            email: faker.internet.email(),
            complete: true,
        });
        for(let j=0; j < randomInt(1, 5); j++){
            const price = randomInt(10, 100);
            const quantity = randomInt(1, 5);
            await orderService.addOrderItems({
                order,
                product_title: faker.lorem.words(2),
                price,
                quantity,
                admin_revenue: (price * quantity) * 0.9,
                ambassador_revenue: (price * quantity) * 0.1
            })
        }
    }

    process.exit();
})();