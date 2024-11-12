import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class RegistrDto {
    @IsEmail({}, {message: "Введите корректный Email"})
    email: string;

    @MinLength(5, {message: "Минимальное количество символов для пароля 5"})
    password: string
}

export class LoginDto {
    @IsEmail({}, {message: "Введите корректный Email"})
    email: string;

    @IsNotEmpty({message: "Заполните поле"})
    password: string
}