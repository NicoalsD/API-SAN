import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PropietarioGuard } from '../auth/propietario.guard';
import {
  ActualizarUsuarioDto,
  FavoritoDto,
  PreferenciaDto,
} from './usuario.dto';
import { UsuarioService } from './usuario.service';

@ApiTags('usuarios')
@Controller('usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PropietarioGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get(':id')
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuarioService.obtener(id);
  }

  @Put(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cambios: ActualizarUsuarioDto,
  ) {
    return this.usuarioService.actualizar(id, cambios);
  }

  @Get(':id/preferencias')
  obtenerPreferencias(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuarioService.obtenerPreferencias(id);
  }

  @Put(':id/preferencias')
  actualizarPreferencias(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() datos: PreferenciaDto,
  ) {
    return this.usuarioService.actualizarPreferencias(id, datos);
  }

  @Get(':id/favoritos')
  listarFavoritos(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuarioService.listarFavoritos(id);
  }

  @Post(':id/favoritos')
  agregarFavorito(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() datos: FavoritoDto,
  ) {
    return this.usuarioService.agregarFavorito(id, datos);
  }

  @Delete(':id/favoritos/:ofertaId')
  eliminarFavorito(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('ofertaId', ParseUUIDPipe) ofertaId: string,
  ) {
    return this.usuarioService.eliminarFavorito(id, ofertaId);
  }
}
