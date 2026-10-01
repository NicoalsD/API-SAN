import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { BusquedaController } from './busquedas/busqueda.controller';
import { BusquedaService } from './busquedas/busqueda.service';
import { ScoringService } from './busquedas/scoring.service';
import { UsuarioController } from './usuarios/usuario.controller';
import { UsuarioService } from './usuarios/usuario.service';

@Module({
  imports: [],
  controllers: [AuthController, UsuarioController, BusquedaController],
  providers: [AuthService, UsuarioService, BusquedaService, ScoringService],
})
export class AppModule {}