import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    UsersModule, 
    AuthModule, 
    RolesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
