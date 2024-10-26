import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegistrDto } from './dto/create.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        readonly prisma: PrismaService,
        readonly userService: UsersService
    ) {}

    async registr (dto: RegistrDto) {
        const {email, password} = dto
        const candidate = await this.userService.foundOneUser(email)
        if(candidate) throw new HttpException('Пользователь с таким Email уже есть', HttpStatus.BAD_REQUEST)

        const hashPassword = await bcrypt.hash(password, 5)
        const user = await this.prisma.user.create({
            data: {
                email: email,
                password: hashPassword
            }
        })

        return user
    }
}
