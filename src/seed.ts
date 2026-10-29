import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { sembrarBd } from './common/semilla';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await sembrarBd(app.get(DataSource));
  await app.close();
}

bootstrap();
