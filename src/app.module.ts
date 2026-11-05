import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env } from './env.model';
import { AuthModule } from './auth/auth.module';
import { BusquedaModule } from './busquedas/busqueda.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { ComparacionModule } from './comparacion/comparacion.module';
import { QueryFailedFilter } from './common/filtros/query-failed.filter';
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
    AuthModule,
    UsuarioModule,
    BusquedaModule,
    CatalogoModule,
    ComparacionModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: QueryFailedFilter }],
})
export class AppModule {}
