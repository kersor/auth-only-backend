import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegistrDto } from './dto/create.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('/registr')
  async registr (@Body() dto: RegistrDto, @Res() res: Response) {
    const data = await this.authService.registr(dto);

    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true, 
      maxAge: 30 * 24 * 60 * 60 * 1000
    })

    return res.json(data)
  }

  @Post('/login')
  async login (@Body() dto: LoginDto, @Res() res: Response) {
    const data = await this.authService.login(dto)

    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true, 
      maxAge: 30 * 24 * 60 * 60 * 1000
    })

    return res.json(data)
  }

  // Выйти из аккаунта
  @Post('/logout')
  async logout (@Req() req: Request, @Res() res: Response) {
    const { refreshToken } = req.cookies

    await this.authService.logout(refreshToken)
    res.clearCookie('refreshToken', {
      httpOnly: true,
    })
    return res.status(200).send({status: 'sussus'});
  }
 
  // Активация аккаунта по ссылки
  @Get('/activate/:link')
  async activate (@Param('link') link: string, @Res() res: Response) {
  
    await this.authService.activate(link)
    return res.redirect(process.env.CLIENT_URL) 
  } 

  // Обновление ACCESS токена
  @Get('/refresh')
  async refresh (@Req() req: Request, @Res() res: Response) {
    const {refreshToken} = req.cookies

    const data = await this.authService.refresh(refreshToken)
    
    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true, 
      maxAge: 30 * 24 * 60 * 60 * 1000
    })

    return res.json(data)
  }
}
