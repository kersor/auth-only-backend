import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LoginDto, RegistrDto } from './dto/create.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'
import * as uuid from 'uuid'
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer'


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
        await this.sendActivationMail(email, `${process.env.API_URL}/api/auth/activate/${activationLink}`)
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

    async sendActivationMail (to: string, link: string) {
        const text = `Здравствуйте!
        Спасибо за регистрацию на нашем сайте! Чтобы активировать ваш аккаунт, пожалуйста, подтвердите ваш адрес электронной почты, перейдя по следующей ссылке:

        ${link}

        Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.

        Если у вас возникли вопросы, не стесняйтесь обращаться к нам.

        С уважением,
        Ваша команда: SVOLOCHYO`
        const html = `
            <p>Здравствуйте!</p>
            <p>Спасибо за регистрацию на нашем сайте! Чтобы активировать ваш аккаунт, пожалуйста, подтвердите ваш адрес электронной почты, перейдя по следующей ссылке:</p>
            <p><a href="${link}">${link}</a></p>
            <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
            <p>Если у вас возникли вопросы, не стесняйтесь обращаться к нам.</p>
            <p>С уважением,<br>Ваша команда: SVOLOCHYO</p>
        `;

        const transporet = nodemailer.createTransport({
            host: 'smtp.mail.ru',
            port: +process.env.PORT_EMAIL,
            auth: {
                user: process.env.FROM_EMAIL,
                pass: process.env.PASSWORD_EXTERNAL_APPLICATION
            }
        })

        try {
            await transporet.sendMail({
                from: `Подтвердите ваш аккаунт <${process.env.FROM_EMAIL}>`,
                to: to, 
                subject: "Подтверждение вашей электронной почты", 
                text: text,
                html: html
            });
        } catch (error) {
            console.log('Error: ', error)
        }
    }

    async activate (link: string) {
        const user = await this.prisma.user.findFirst({where: {activationLink: link}})
        if(!user) throw new BadRequestException('Некорректная ссылка активации')

        await this.prisma.user.update({
            where: { id: user.id },
            data: { isActivated: true }
        });
    }


    async generateToken (payload: any) {
        const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
    
        return {
            accessToken,
            refreshToken,
        };
    }

    async saveToken (id: number, refreshToken: string) {
        const tokenData = await this.prisma.token.findFirst({where: {userId: id}})
        if(tokenData) {
            await this.prisma.token.update({
                where: {userId: id},
                data: {
                    refreshToken: refreshToken
                }
            })
        }
        const token = await this.prisma.token.create({data: {userId: id, refreshToken: refreshToken}})
        return token
    }

    async removeToken (refreshToken: string) {
        const token = await this.prisma.token.delete({where: {refreshToken: refreshToken}})
        return token
    }

    async login (dto: LoginDto) {
        const candidate = await this.userService.foundOneUser(dto.email)
        if(!candidate) throw new HttpException('Неверный Email или Пароль', HttpStatus.BAD_REQUEST)

        const password = bcrypt.compareSync(dto.password, candidate.password)
        if(!password) throw new HttpException('Неверный Email или Пароль', HttpStatus.BAD_REQUEST)

        const { id, email, isActivated } = candidate

        const tokens = await this.generateToken({id, email, isActivated})

        return {
            ...tokens,
            user: {
                id,
                email,
                isActivated
            }
        }
    }

    async logout (refreshToken: string) {
        const token = await this.removeToken(refreshToken)
        console.log(token)
        return token
    }
}
