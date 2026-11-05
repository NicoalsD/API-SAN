import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { FiltroCarreraDto, FiltroUniversidadDto } from './catalogo.dto';
import { CatalogoService } from './catalogo.service';

@Controller()
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get('carreras')
  listarCarreras(@Query() filtros: FiltroCarreraDto) {
    return this.catalogoService.listarCarreras(filtros.nombre);
  }

  @Get('carreras/:id')
  obtenerCarrera(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogoService.obtenerCarrera(id);
  }

  @Get('universidades')
  listarUniversidades(@Query() filtros: FiltroUniversidadDto) {
    return this.catalogoService.listarUniversidades(filtros.ciudad);
  }

  @Get('universidades/:id')
  obtenerUniversidad(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogoService.obtenerUniversidad(id);
  }

  @Get('ofertas/:id')
  obtenerOferta(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogoService.obtenerOferta(id);
  }
}
