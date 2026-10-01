import { Injectable, NotFoundException } from '@nestjs/common';
import { OFERTAS } from '../common/ofertas.mock';
import { BusquedaRequestDto, ResultadoBusquedaDto } from './busqueda.dto';
import { ScoringService } from './scoring.service';

interface Busqueda {
  id: string;
  filtros: BusquedaRequestDto;
  resultados: ResultadoBusquedaDto[];
  fecha: string;
}

@Injectable()
export class BusquedaService {
  private busquedas: Busqueda[] = [];

  constructor(private readonly scoringService: ScoringService) {}

  crear(datos: BusquedaRequestDto) {
    const resultados = this.filtrar(datos)
      .map((oferta) => ({
        oferta,
        ...this.scoringService.calcular(oferta, datos),
      }))
      .sort((a, b) => b.puntaje - a.puntaje);

    const busqueda: Busqueda = {
      id: `${new Date().getTime()}`,
      filtros: datos,
      resultados,
      fecha: new Date().toISOString(),
    };
    this.busquedas.push(busqueda);

    return {
      message: 'Busqueda realizada correctamente',
      data: { id: busqueda.id, total: resultados.length, resultados },
    };
  }

  obtener(id: string) {
    const busqueda = this.buscarBusqueda(id);

    return {
      id: busqueda.id,
      filtros: busqueda.filtros,
      total: busqueda.resultados.length,
      fecha: busqueda.fecha,
    };
  }

  obtenerResultados(id: string) {
    return this.buscarBusqueda(id).resultados;
  }

  private filtrar(filtros: BusquedaRequestDto) {
    return OFERTAS.filter((oferta) => {
      if (oferta.carrera.toLowerCase() !== filtros.carrera.toLowerCase()) {
        return false;
      }
      if (
        filtros.ciudad &&
        oferta.ciudad.toLowerCase() !== filtros.ciudad.toLowerCase()
      ) {
        return false;
      }
      if (filtros.costoMax !== undefined && oferta.costo > filtros.costoMax) {
        return false;
      }
      if (filtros.modalidad && oferta.modalidad !== filtros.modalidad) {
        return false;
      }
      if (filtros.jornada && oferta.jornada !== filtros.jornada) {
        return false;
      }

      return true;
    });
  }

  private buscarBusqueda(id: string) {
    const busqueda = this.busquedas.find((busqueda) => busqueda.id === id);
    if (busqueda === undefined) {
      throw new NotFoundException(`Busqueda con ID ${id} no existe`);
    }

    return busqueda;
  }
}