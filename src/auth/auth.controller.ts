import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrDto } from './dto/create.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('/registr')
  async registr (@Body() dto: RegistrDto) {
    return this.authService.registr(dto)
  }

  @Post('/login')
  async login () {

  }

  // Выйти из аккаунта
  @Post('/logout')
  async logout () {

  }

  // Активация аккаунта по ссылки
  @Get('/activate/:link')
  async activate () {

  }

  // Обновление ACCESS токена
  @Get('/refresh')
  async refresh () {

  }
}
