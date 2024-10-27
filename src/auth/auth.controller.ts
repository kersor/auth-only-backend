import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrDto } from './dto/create.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('/registr')
  async registr (@Body() dto: RegistrDto, @Res() res: Response) {
    const tokens = await this.authService.registr(dto);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true, 
      maxAge: 30 * 24 * 60 * 60 * 1000
    })
    return res.json({
      access_token: tokens.accessToken,
      user: {
        ...tokens.user
      }
    })
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
