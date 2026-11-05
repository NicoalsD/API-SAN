import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Env } from './env.model';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const configService = app.get(ConfigService<Env>);
  app.enableCors({ origin: configService.getOrThrow('CORS_ORIGIN') });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
