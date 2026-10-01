import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { BusquedaController } from './busquedas/busqueda.controller';
import { BusquedaService } from './busquedas/busqueda.service';
import { ScoringService } from './busquedas/scoring.service';
import { CatalogoController } from './catalogo/catalogo.controller';
import { CatalogoService } from './catalogo/catalogo.service';
import { ComparacionController } from './comparacion/comparacion.controller';
import { ComparacionService } from './comparacion/comparacion.service';
import { UsuarioController } from './usuarios/usuario.controller';
import { UsuarioService } from './usuarios/usuario.service';

@Module({
  imports: [],
  controllers: [
    AuthController,
    UsuarioController,
    BusquedaController,
    CatalogoController,
    ComparacionController,
  ],
  providers: [
    AuthService,
    UsuarioService,
    BusquedaService,
    ScoringService,
    CatalogoService,
    ComparacionService,
  ],
})
export class AppModule {}