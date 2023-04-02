import { NestFactory } from "@nestjs/core"
import { AppModule } from "src/app.module"
import { faker } from '@faker-js/faker'
import * as bcrypt from 'bcrypt';
import { UserService } from "src/user/user.service";

(async () => {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userService = app.get(UserService);
    const password = await bcrypt.hash('1234', 10);
    for(let i=0; i<30; i++){
        await userService.save({
            firstname: faker.name.firstName(),
            lastname: faker.name.lastName(),
            email: faker.internet.email(),
            password,
            isAmbassador: true,
        })
    }

    process.exit();
})();