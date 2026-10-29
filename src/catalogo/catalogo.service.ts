import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CarreraDto, OfertaAcademicaDto, UniversidadDto } from './catalogo.dto';
import { Carrera } from './carrera.entity';
import { OfertaAcademica } from './oferta-academica.entity';
import { Universidad } from './universidad.entity';

@Injectable()
export class CatalogoService {
  constructor(
    @InjectRepository(Carrera)
    private readonly carreraRepository: Repository<Carrera>,
    @InjectRepository(Universidad)
    private readonly universidadRepository: Repository<Universidad>,
    @InjectRepository(OfertaAcademica)
    private readonly ofertaRepository: Repository<OfertaAcademica>,
  ) {}

  async listarCarreras(): Promise<CarreraDto[]> {
    return this.carreraRepository.find({ order: { nombre: 'ASC' } });
  }

  async obtenerCarrera(id: string) {
    const carrera = await this.carreraRepository.findOneBy({ id });
    if (carrera === null) {
      throw new NotFoundException(`Carrera con ID ${id} no existe`);
    }

    return carrera;
  }

  async listarUniversidades(): Promise<UniversidadDto[]> {
    return this.universidadRepository.find({ order: { nombre: 'ASC' } });
  }

  async obtenerUniversidad(id: string) {
    const universidad = await this.universidadRepository.findOneBy({ id });
    if (universidad === null) {
      throw new NotFoundException(`Universidad con ID ${id} no existe`);
    }

    return universidad;
  }

  async listarOfertas(): Promise<OfertaAcademicaDto[]> {
    const ofertas = await this.ofertaRepository.find({
      relations: { universidad: true, carrera: true },
      order: { snies: 'ASC' },
    });

    return ofertas.map((oferta) => this.aDto(oferta));
  }

  async obtenerOferta(id: string): Promise<OfertaAcademicaDto> {
    const oferta = await this.buscarOferta(id);

    return this.aDto(oferta);
  }

  async obtenerOfertas(ids: string[]): Promise<OfertaAcademica[]> {
    const ofertas = await this.ofertaRepository.find({
      where: { id: In(ids) },
      relations: { universidad: true, carrera: true },
    });
    const porId = new Map(ofertas.map((oferta) => [oferta.id, oferta]));

    return ids.map((id) => {
      const oferta = porId.get(id);
      if (oferta === undefined) {
        throw new NotFoundException(`Oferta con ID ${id} no existe`);
      }

      return oferta;
    });
  }

  private async buscarOferta(id: string) {
    const oferta = await this.ofertaRepository.findOne({
      where: { id },
      relations: { universidad: true, carrera: true },
    });
    if (oferta === null) {
      throw new NotFoundException(`Oferta con ID ${id} no existe`);
    }

    return oferta;
  }

  private aDto(oferta: OfertaAcademica): OfertaAcademicaDto {
    return {
      id: oferta.id,
      universidad: oferta.universidad.nombre,
      carrera: oferta.carrera.nombre,
      ciudad: oferta.ciudad,
      costo: oferta.costo,
      modalidad: oferta.modalidad,
      jornada: oferta.jornada,
      duracion: oferta.duracion,
      acreditacion: oferta.acreditacion,
      snies: oferta.snies,
    };
  }
}
