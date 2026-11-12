import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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
  const documento = new DocumentBuilder()
    .setTitle('API SAN')
    .setDescription('Sistema Academico de Navegacion')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, documento),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
