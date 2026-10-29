import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogoService } from '../catalogo/catalogo.service';
import { Comparacion } from './comparacion.entity';
import {
  ComparacionDto,
  ComparacionRequestDto,
  FilaComparacionDto,
} from './comparacion.dto';

@Injectable()
export class ComparacionService {
  constructor(
    @InjectRepository(Comparacion)
    private readonly comparacionRepository: Repository<Comparacion>,
    private readonly catalogoService: CatalogoService,
  ) {}

  async crear(datos: ComparacionRequestDto) {
    if (new Set(datos.ofertaIds).size !== datos.ofertaIds.length) {
      throw new BadRequestException(
        'No se pueden repetir ofertas en la comparacion',
      );
    }

    const ofertas = await this.catalogoService.obtenerOfertas(datos.ofertaIds);
    const maxCostoTotal = Math.max(
      ...ofertas.map((oferta) => oferta.costo * oferta.duracion),
    );

    const tabla: FilaComparacionDto[] = ofertas
      .map((oferta) => {
        const costoTotal = oferta.costo * oferta.duracion;

        return {
          ofertaId: oferta.id,
          universidad: oferta.universidad.nombre,
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

    const mejorOferta =
      ofertas.find((oferta) => oferta.id === tabla[0].ofertaId) ?? ofertas[0];
    const comparacion = await this.comparacionRepository.save(
      this.comparacionRepository.create({
        ofertas,
        tabla,
        mejorOferta,
      }),
    );

    return {
      message: 'Comparacion creada correctamente',
      data: this.aDto(comparacion),
    };
  }

  async obtener(id: string): Promise<ComparacionDto> {
    return this.aDto(await this.buscarComparacion(id));
  }

  async eliminar(id: string) {
    const comparacion = await this.buscarComparacion(id);
    await this.comparacionRepository.remove(comparacion);

    return {
      message: 'Comparacion eliminada correctamente',
    };
  }

  private async buscarComparacion(id: string) {
    const comparacion = await this.comparacionRepository.findOne({
      where: { id },
      relations: { mejorOferta: true },
    });
    if (comparacion === null) {
      throw new NotFoundException(`Comparacion con ID ${id} no existe`);
    }

    return comparacion;
  }

  private aDto(comparacion: Comparacion): ComparacionDto {
    return {
      id: comparacion.id,
      tabla: comparacion.tabla,
      mejorOfertaId: comparacion.mejorOferta?.id ?? '',
    };
  }
}
