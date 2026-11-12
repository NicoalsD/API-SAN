import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { OfertaAcademica } from '../catalogo/oferta-academica.entity';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { Perfil } from './perfil.entity';
import { Usuario } from './usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Perfil, OfertaAcademica]),
    AuthModule,
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
