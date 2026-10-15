import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env } from './env.model';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { BusquedaController } from './busquedas/busqueda.controller';
import { BusquedaService } from './busquedas/busqueda.service';
import { ScoringService } from './busquedas/scoring.service';
import { CatalogoController } from './catalogo/catalogo.controller';
import { CatalogoService } from './catalogo/catalogo.service';
import { ComparacionController } from './comparacion/comparacion.controller';
import { ComparacionService } from './comparacion/comparacion.service';
import { UsuarioModule } from './usuarios/usuario.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<Env>) => ({
        type: 'postgres',
        host: configService.getOrThrow('POSTGRES_HOST'),
        port: configService.getOrThrow<number>('POSTGRES_PORT'),
        username: configService.getOrThrow('POSTGRES_USER'),
        password: configService.getOrThrow('POSTGRES_PASSWORD'),
        database: configService.getOrThrow('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsuarioModule,
  ],
  controllers: [
    AuthController,
    BusquedaController,
    CatalogoController,
    ComparacionController,
  ],
  providers: [
    AuthService,
    BusquedaService,
    ScoringService,
    CatalogoService,
    ComparacionService,
  ],
})
export class AppModule {}
