import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuracion from './config/configuracion';
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
    ConfigModule.forRoot({ isGlobal: true, load: [configuracion] }),
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