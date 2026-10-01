import { Injectable, NotFoundException } from '@nestjs/common';
import { OFERTAS, OfertaAcademica } from '../common/ofertas.mock';
import { CarreraDto, UniversidadDto } from './catalogo.dto';

@Injectable()
export class CatalogoService {
  private carreras: CarreraDto[] = [
    { id: '1', nombre: 'Ingenieria de Sistemas' },
    { id: '2', nombre: 'Derecho' },
    { id: '3', nombre: 'Medicina' },
  ];

  private universidades: UniversidadDto[] = [
    { id: '1', nombre: 'Universidad Nacional de Colombia', ciudad: 'Bogota' },
    { id: '2', nombre: 'Universidad de los Andes', ciudad: 'Bogota' },
    { id: '3', nombre: 'Universidad Javeriana', ciudad: 'Bogota' },
    { id: '4', nombre: 'Universidad de Antioquia', ciudad: 'Medellin' },
    { id: '5', nombre: 'Universidad EAFIT', ciudad: 'Medellin' },
  ];

  listarCarreras() {
    return this.carreras;
  }

  obtenerCarrera(id: string) {
    const carrera = this.carreras.find((carrera) => carrera.id === id);
    if (carrera === undefined) {
      throw new NotFoundException(`Carrera con ID ${id} no existe`);
    }

    return carrera;
  }

  listarUniversidades() {
    return this.universidades;
  }

  obtenerUniversidad(id: string) {
    const universidad = this.universidades.find(
      (universidad) => universidad.id === id,
    );
    if (universidad === undefined) {
      throw new NotFoundException(`Universidad con ID ${id} no existe`);
    }

    return universidad;
  }

  obtenerOferta(id: string): OfertaAcademica {
    const oferta = OFERTAS.find((oferta) => oferta.id === id);
    if (oferta === undefined) {
      throw new NotFoundException(`Oferta con ID ${id} no existe`);
    }

    return oferta;
  }
}