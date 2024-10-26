import { Injectable } from '@nestjs/common';
import e from 'express';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
    constructor (readonly prisma: PrismaService) {}

    async foundOneUser (email: string) {
        const candidate = await this.prisma.user.findFirst({where: {email: email}})
        return candidate
    }
}
