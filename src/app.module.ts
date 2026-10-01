import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UsuarioController } from './usuarios/usuario.controller';
import { UsuarioService } from './usuarios/usuario.service';

@Module({
  imports: [],
  controllers: [AuthController, UsuarioController],
  providers: [AuthService, UsuarioService],
})
export class AppModule {}