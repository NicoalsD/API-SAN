import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Configuracion } from './configuracion';

export const configuracionBaseDatos = (
  configService: ConfigService<Configuracion, true>,
): TypeOrmModuleOptions => {
  const baseDatos = configService.get('baseDatos', { infer: true });

  return {
    type: 'postgres',
    host: baseDatos.host,
    port: baseDatos.puerto,
    username: baseDatos.usuario,
    password: baseDatos.contrasena,
    database: baseDatos.nombre,
    autoLoadEntities: true,
    synchronize: baseDatos.sincronizar,
  };
};
