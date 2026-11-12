import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ActualizarCarreraDto,
  ActualizarOfertaDto,
  ActualizarUniversidadDto,
  CrearCarreraDto,
  CrearOfertaDto,
  CrearUniversidadDto,
  FiltroCarreraDto,
  FiltroOfertaDto,
  FiltroUniversidadDto,
} from './catalogo.dto';
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

  @Post('carreras')
  crearCarrera(@Body() datos: CrearCarreraDto) {
    return this.catalogoService.crearCarrera(datos);
  }

  @Put('carreras/:id')
  actualizarCarrera(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cambios: ActualizarCarreraDto,
  ) {
    return this.catalogoService.actualizarCarrera(id, cambios);
  }

  @Delete('carreras/:id')
  eliminarCarrera(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogoService.eliminarCarrera(id);
  }

  @Get('universidades')
  listarUniversidades(@Query() filtros: FiltroUniversidadDto) {
    return this.catalogoService.listarUniversidades(filtros.ciudad);
  }

  @Get('universidades/:id')
  obtenerUniversidad(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogoService.obtenerUniversidad(id);
  }

  @Post('universidades')
  crearUniversidad(@Body() datos: CrearUniversidadDto) {
    return this.catalogoService.crearUniversidad(datos);
  }

  @Put('universidades/:id')
  actualizarUniversidad(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cambios: ActualizarUniversidadDto,
  ) {
    return this.catalogoService.actualizarUniversidad(id, cambios);
  }

  @Delete('universidades/:id')
  eliminarUniversidad(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogoService.eliminarUniversidad(id);
  }

  @Get('ofertas')
  listarOfertas(@Query() filtros: FiltroOfertaDto) {
    return this.catalogoService.listarOfertas(filtros);
  }

  @Get('ofertas/:id')
  obtenerOferta(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogoService.obtenerOferta(id);
  }

  @Post('ofertas')
  crearOferta(@Body() datos: CrearOfertaDto) {
    return this.catalogoService.crearOferta(datos);
  }

  @Put('ofertas/:id')
  actualizarOferta(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cambios: ActualizarOfertaDto,
  ) {
    return this.catalogoService.actualizarOferta(id, cambios);
  }

  @Delete('ofertas/:id')
  eliminarOferta(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogoService.eliminarOferta(id);
  }
}
