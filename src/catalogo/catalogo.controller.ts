import { Controller, Get, Param } from '@nestjs/common';
import { CatalogoService } from './catalogo.service';

@Controller()
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get('carreras')
  listarCarreras() {
    return this.catalogoService.listarCarreras();
  }

  @Get('carreras/:id')
  obtenerCarrera(@Param('id') id: string) {
    return this.catalogoService.obtenerCarrera(id);
  }

  @Get('universidades')
  listarUniversidades() {
    return this.catalogoService.listarUniversidades();
  }

  @Get('universidades/:id')
  obtenerUniversidad(@Param('id') id: string) {
    return this.catalogoService.obtenerUniversidad(id);
  }

  @Get('ofertas/:id')
  obtenerOferta(@Param('id') id: string) {
    return this.catalogoService.obtenerOferta(id);
  }
}