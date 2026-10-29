import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ComparacionRequestDto } from './comparacion.dto';
import { ComparacionService } from './comparacion.service';

@Controller('comparaciones')
export class ComparacionController {
  constructor(private readonly comparacionService: ComparacionService) {}

  @Post()
  crear(@Body() datos: ComparacionRequestDto) {
    return this.comparacionService.crear(datos);
  }

  @Get(':id')
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.comparacionService.obtener(id);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.comparacionService.eliminar(id);
  }
}
