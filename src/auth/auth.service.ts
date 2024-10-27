import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegistrDto } from './dto/create.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'
import * as uuid from 'uuid'
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(
        readonly prisma: PrismaService,
        readonly userService: UsersService,
        readonly jwtService: JwtService
    ) {}

    async registr (dto: RegistrDto) {

        const candidate = await this.userService.foundOneUser(dto.email)
        if(candidate) throw new HttpException('Пользователь с таким Email уже есть', HttpStatus.BAD_REQUEST)

        const hashPassword = await bcrypt.hash(dto.password, 5)
        const activationLink = uuid.v4()
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashPassword,
                activationLink: activationLink
            }
        })
        const {id, email, isActivated} = user
        const mail = await this.activate(email, activationLink)
        const tokens = await this.generateToken({id, email, isActivated})
        await this.saveToken(id, tokens.refreshToken)

        return {
            ...tokens,
            user: {
                id,
                email,
                isActivated,
            }
        }
    }

    async activate (to: string, link: string) {

    }

    async generateToken (payload: any) {
        const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' }); // Access token истекает через 30 минут
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' }); // Refresh token истекает через 30 дней
        
        console.log(this.jwtService.decode(accessToken)); // Декодирование access token
        console.log(this.jwtService.decode(refreshToken))
    
        return {
          accessToken,
          refreshToken,
        };
    }

    async saveToken (id, refreshToken) {
        const tokenData = await this.prisma.token.findFirst({where: {userId: id}})
        if(tokenData) {
            await this.prisma.token.update({
                where: {userId: id},
                data: refreshToken
            })
            const token = await this.prisma.token.create({data: {userId: id, refreshToken: refreshToken}})
            return token
        }
    }
}
