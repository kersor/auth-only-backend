import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    await this.createDefaultRoles();
  }


   // Метод для создания дефолтных ролей
   async createDefaultRoles() {
    const roles = [
      { name: 'USER', fullName: 'Пользователь' },
      { name: 'ADMIN', fullName: 'Администратор' },
    ];

    for (const role of roles) {
      const existingRole = await this.role.findUnique({
        where: { name: role.name },
      });

      // Если роль не найдена, создаем её
      if (!existingRole) {
        await this.role.create({
          data: {
            name: role.name,
            fullName: role.fullName,
          },
        });
        console.log(`Роль "${role.name}" успешно создана.`);
      }
    }
  }
}