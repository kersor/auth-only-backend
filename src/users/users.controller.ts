import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from 'src/roles/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get()
  async getAllUsers () {
    return this.usersService.getAllUsers()
  }
}
