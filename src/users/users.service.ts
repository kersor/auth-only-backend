import { Injectable } from '@nestjs/common';
import e from 'express';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
    constructor (
        readonly prisma: PrismaService
    ) {}

    async foundOneUser (email: string) {
        const candidate = await this.prisma.user.findFirst(
            {
                where: {
                    email: email
                },
                include: {
                    roles: {
                        include: {
                            role: true
                        }
                    }
                }
            }
        )
        return candidate
    }

    async getAllUsers () {
        const users = await this.prisma.user.findMany({
            include: {
                refreshToken: true
            }
        })
        return users
    }
}
