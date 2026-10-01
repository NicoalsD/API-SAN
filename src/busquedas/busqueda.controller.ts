import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BusquedaRequestDto } from './busqueda.dto';
import { BusquedaService } from './busqueda.service';

@Controller('busquedas')
export class BusquedaController {
  constructor(private readonly busquedaService: BusquedaService) {}

  @Post()
  crear(@Body() datos: BusquedaRequestDto) {
    return this.busquedaService.crear(datos);
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.busquedaService.obtener(id);
  }

  @Get(':id/resultados')
  obtenerResultados(@Param('id') id: string) {
    return this.busquedaService.obtenerResultados(id);
  }
}