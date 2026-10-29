import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogoService } from '../catalogo/catalogo.service';
import { OfertaAcademicaDto } from '../catalogo/catalogo.dto';
import { Busqueda } from './busqueda.entity';
import { BusquedaRequestDto, ResultadoBusquedaDto } from './busqueda.dto';
import { ScoringService } from './scoring.service';

@Injectable()
export class BusquedaService {
  constructor(
    @InjectRepository(Busqueda)
    private readonly busquedaRepository: Repository<Busqueda>,
    private readonly catalogoService: CatalogoService,
    private readonly scoringService: ScoringService,
  ) {}

  async crear(datos: BusquedaRequestDto) {
    const ofertas = await this.catalogoService.listarOfertas();
    const resultados: ResultadoBusquedaDto[] = this.filtrar(ofertas, datos)
      .map((oferta) => ({
        oferta,
        ...this.scoringService.calcular(oferta, datos),
      }))
      .sort((a, b) => b.puntaje - a.puntaje);

    const busqueda = await this.busquedaRepository.save(
      this.busquedaRepository.create({
        filtros: datos,
        resultados,
      }),
    );

    return {
      message: 'Busqueda realizada correctamente',
      data: {
        id: busqueda.id,
        total: resultados.length,
        resultados: busqueda.resultados,
      },
    };
  }

  async obtener(id: string) {
    const busqueda = await this.buscarBusqueda(id);

    return {
      id: busqueda.id,
      filtros: busqueda.filtros,
      total: busqueda.resultados.length,
      fecha: busqueda.fecha.toISOString(),
    };
  }

  async obtenerResultados(id: string) {
    return (await this.buscarBusqueda(id)).resultados;
  }

  private filtrar(ofertas: OfertaAcademicaDto[], filtros: BusquedaRequestDto) {
    return ofertas.filter((oferta) => {
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

  private async buscarBusqueda(id: string) {
    const busqueda = await this.busquedaRepository.findOneBy({ id });
    if (busqueda === null) {
      throw new NotFoundException(`Busqueda con ID ${id} no existe`);
    }

    return busqueda;
  }
}
