import {IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString} from "class-validator";

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    firstname: string;

    @IsString()
    @IsNotEmpty()
    lastname: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    password_confirmation: string;

    @IsBoolean()
    @IsOptional()
    isAmbassador: boolean;
}