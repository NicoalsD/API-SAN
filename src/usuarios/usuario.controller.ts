import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { FavoritoDto, PreferenciaDto } from './usuario.dto';
import { UsuarioService } from './usuario.service';

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get(':id/preferencias')
  obtenerPreferencias(@Param('id') id: string) {
    return this.usuarioService.obtenerPreferencias(id);
  }

  @Put(':id/preferencias')
  actualizarPreferencias(
    @Param('id') id: string,
    @Body() datos: PreferenciaDto,
  ) {
    return this.usuarioService.actualizarPreferencias(id, datos);
  }

  @Get(':id/favoritos')
  listarFavoritos(@Param('id') id: string) {
    return this.usuarioService.listarFavoritos(id);
  }

  @Post(':id/favoritos')
  agregarFavorito(@Param('id') id: string, @Body() datos: FavoritoDto) {
    return this.usuarioService.agregarFavorito(id, datos);
  }

  @Delete(':id/favoritos/:ofertaId')
  eliminarFavorito(
    @Param('id') id: string,
    @Param('ofertaId') ofertaId: string,
  ) {
    return this.usuarioService.eliminarFavorito(id, ofertaId);
  }
}