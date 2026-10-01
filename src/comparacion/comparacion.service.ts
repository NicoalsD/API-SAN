import { Injectable, NotFoundException } from '@nestjs/common';
import { CatalogoService } from '../catalogo/catalogo.service';
import {
  ComparacionDto,
  ComparacionRequestDto,
  FilaComparacionDto,
} from './comparacion.dto';

@Injectable()
export class ComparacionService {
  private comparaciones: ComparacionDto[] = [];

  constructor(private readonly catalogoService: CatalogoService) {}

  crear(datos: ComparacionRequestDto) {
    const ofertas = datos.ofertaIds.map((id) =>
      this.catalogoService.obtenerOferta(id),
    );
    const maxCostoTotal = Math.max(
      ...ofertas.map((oferta) => oferta.costo * oferta.duracion),
    );

    const tabla: FilaComparacionDto[] = ofertas
      .map((oferta) => {
        const costoTotal = oferta.costo * oferta.duracion;

        return {
          ofertaId: oferta.id,
          universidad: oferta.universidad,
          costoTotal,
          duracion: oferta.duracion,
          modalidad: oferta.modalidad,
          acreditacion: oferta.acreditacion,
          puntaje:
            (oferta.acreditacion ? 50 : 0) +
            Math.round(50 * (1 - costoTotal / maxCostoTotal)),
        };
      })
      .sort((a, b) => b.puntaje - a.puntaje);

    const comparacion: ComparacionDto = {
      id: `${new Date().getTime()}`,
      tabla,
      mejorOfertaId: tabla[0].ofertaId,
    };
    this.comparaciones.push(comparacion);

    return {
      message: 'Comparacion creada correctamente',
      data: comparacion,
    };
  }

  obtener(id: string) {
    return this.buscarComparacion(id);
  }

  eliminar(id: string) {
    const posicion = this.comparaciones.findIndex(
      (comparacion) => comparacion.id === id,
    );
    if (posicion === -1) {
      throw new NotFoundException(`Comparacion con ID ${id} no existe`);
    }
    this.comparaciones.splice(posicion, 1);

    return {
      message: 'Comparacion eliminada correctamente',
    };
  }

  private buscarComparacion(id: string) {
    const comparacion = this.comparaciones.find(
      (comparacion) => comparacion.id === id,
    );
    if (comparacion === undefined) {
      throw new NotFoundException(`Comparacion con ID ${id} no existe`);
    }

    return comparacion;
  }
}