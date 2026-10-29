import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { FavoritoDto, PreferenciaDto } from './usuario.dto';
import { UsuarioService } from './usuario.service';

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

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
