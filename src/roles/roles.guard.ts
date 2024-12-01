// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt'; // Используется для работы с JWT
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector, // Для извлечения метаданных (ролей)
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Извлекаем метаданные ролей из декоратора
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true; // Если роли не указаны, разрешаем доступ
    }

    const request = context.switchToHttp().getRequest();

    const token = request.headers.authorization?.split(' ')[1]; // Извлекаем токен из заголовка Authorization

    if (!token) {
      throw new UnauthorizedException('Нет доступа');
    }

    try {
      const user = this.jwtService.verify(token, {secret: process.env.JWT_SECRET_KEY}); 
      // Извлекаем роль из токена
      const userRoles = user.roles.map(item => item.role.name)
      const result = userRoles.some(item => roles.includes(item))
      return result
    } catch (error) {
      throw new UnauthorizedException('Нет доступа');
    }
  }
}
