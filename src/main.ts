import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api') 
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  
  const port = process.env.PORT || 5000
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
