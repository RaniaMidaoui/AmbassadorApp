import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateProductDto {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    image: string;

    @IsNotEmpty()
    price: number;
}
