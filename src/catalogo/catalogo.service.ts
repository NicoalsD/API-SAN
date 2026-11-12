import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import {
  ActualizarCarreraDto,
  ActualizarOfertaDto,
  ActualizarUniversidadDto,
  CarreraDto,
  CrearCarreraDto,
  CrearOfertaDto,
  CrearUniversidadDto,
  FiltroOfertaDto,
  OfertaAcademicaDto,
  UniversidadDetalleDto,
  UniversidadDto,
} from './catalogo.dto';
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

  async listarCarreras(nombre?: string): Promise<CarreraDto[]> {
    return this.carreraRepository.find({
      where: nombre ? { nombre: ILike(`%${this.escaparLike(nombre)}%`) } : {},
      order: { nombre: 'ASC' },
    });
  }

  async obtenerCarrera(id: string) {
    const carrera = await this.carreraRepository.findOneBy({ id });
    if (carrera === null) {
      throw new NotFoundException(`Carrera con ID ${id} no existe`);
    }

    return carrera;
  }

  async crearCarrera(datos: CrearCarreraDto) {
    await this.validarNombreCarrera(datos.nombre);
    const carrera = await this.carreraRepository.save(
      this.carreraRepository.create(datos),
    );
    return { message: 'Carrera creada correctamente', data: carrera };
  }

  async actualizarCarrera(id: string, cambios: ActualizarCarreraDto) {
    const carrera = await this.obtenerCarrera(id);
    if (cambios.nombre !== undefined && cambios.nombre !== carrera.nombre) {
      await this.validarNombreCarrera(cambios.nombre);
    }
    const actualizada = await this.carreraRepository.save(
      this.carreraRepository.merge(carrera, cambios),
    );
    return { message: 'Carrera actualizada correctamente', data: actualizada };
  }

  async eliminarCarrera(id: string) {
    const carrera = await this.obtenerCarrera(id);
    await this.carreraRepository.remove(carrera);
    return { message: 'Carrera eliminada correctamente' };
  }

  async listarUniversidades(ciudad?: string): Promise<UniversidadDto[]> {
    return this.universidadRepository.find({
      where: ciudad ? { ciudad: ILike(this.escaparLike(ciudad)) } : {},
      order: { nombre: 'ASC' },
    });
  }

  async obtenerUniversidad(id: string): Promise<UniversidadDetalleDto> {
    const universidad = await this.universidadRepository.findOneBy({ id });
    if (universidad === null) {
      throw new NotFoundException(`Universidad con ID ${id} no existe`);
    }

    const ofertas = await this.ofertaRepository.find({
      where: { universidad: { id } },
      relations: { universidad: true, carrera: true },
      order: { snies: 'ASC' },
    });

    return {
      id: universidad.id,
      nombre: universidad.nombre,
      ciudad: universidad.ciudad,
      imagenUrl: universidad.imagenUrl ?? null,
      ofertas: ofertas.map((oferta) => this.aDto(oferta)),
    };
  }

  async crearUniversidad(datos: CrearUniversidadDto) {
    await this.validarNombreUniversidad(datos.nombre);
    const universidad = await this.universidadRepository.save(
      this.universidadRepository.create(datos),
    );
    return { message: 'Universidad creada correctamente', data: universidad };
  }

  async actualizarUniversidad(id: string, cambios: ActualizarUniversidadDto) {
    const universidad = await this.buscarUniversidad(id);
    if (cambios.nombre !== undefined && cambios.nombre !== universidad.nombre) {
      await this.validarNombreUniversidad(cambios.nombre);
    }
    const actualizada = await this.universidadRepository.save(
      this.universidadRepository.merge(universidad, cambios),
    );
    return {
      message: 'Universidad actualizada correctamente',
      data: actualizada,
    };
  }

  async eliminarUniversidad(id: string) {
    const universidad = await this.buscarUniversidad(id);
    await this.universidadRepository.remove(universidad);
    return { message: 'Universidad eliminada correctamente' };
  }

  async listarOfertas(
    filtros: FiltroOfertaDto = {},
  ): Promise<OfertaAcademicaDto[]> {
    const where: FindOptionsWhere<OfertaAcademica> = {};
    if (filtros.carreraId !== undefined) {
      where.carrera = { id: filtros.carreraId };
    }
    if (filtros.universidadId !== undefined) {
      where.universidad = { id: filtros.universidadId };
    }
    if (filtros.ciudad !== undefined) {
      where.ciudad = ILike(this.escaparLike(filtros.ciudad));
    }
    const ofertas = await this.ofertaRepository.find({
      where,
      relations: { universidad: true, carrera: true },
      order: { snies: 'ASC' },
    });

    return ofertas.map((oferta) => this.aDto(oferta));
  }

  async obtenerOferta(id: string): Promise<OfertaAcademicaDto> {
    const oferta = await this.buscarOferta(id);

    return this.aDto(oferta);
  }

  async crearOferta(datos: CrearOfertaDto) {
    const { universidadId, carreraId, ...campos } = datos;
    await this.validarSnies(campos.snies);
    await this.obtenerCarrera(carreraId);
    await this.buscarUniversidad(universidadId);
    const nueva = await this.ofertaRepository.save(
      this.ofertaRepository.create({
        ...campos,
        universidad: { id: universidadId },
        carrera: { id: carreraId },
      }),
    );
    return {
      message: 'Oferta creada correctamente',
      data: await this.obtenerOferta(nueva.id),
    };
  }

  async actualizarOferta(id: string, cambios: ActualizarOfertaDto) {
    const { universidadId, carreraId, ...campos } = cambios;
    const oferta = await this.buscarOferta(id);
    if (campos.snies !== undefined && campos.snies !== oferta.snies) {
      await this.validarSnies(campos.snies);
    }
    if (universidadId !== undefined) {
      await this.buscarUniversidad(universidadId);
      oferta.universidad = { id: universidadId } as Universidad;
    }
    if (carreraId !== undefined) {
      await this.obtenerCarrera(carreraId);
      oferta.carrera = { id: carreraId } as Carrera;
    }
    await this.ofertaRepository.save(
      this.ofertaRepository.merge(oferta, campos),
    );
    return {
      message: 'Oferta actualizada correctamente',
      data: await this.obtenerOferta(id),
    };
  }

  async eliminarOferta(id: string) {
    const oferta = await this.buscarOferta(id);
    await this.ofertaRepository.remove(oferta);
    return { message: 'Oferta eliminada correctamente' };
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

  private async buscarUniversidad(id: string) {
    const universidad = await this.universidadRepository.findOneBy({ id });
    if (universidad === null) {
      throw new NotFoundException(`Universidad con ID ${id} no existe`);
    }
    return universidad;
  }

  private async validarNombreCarrera(nombre: string) {
    if ((await this.carreraRepository.findOneBy({ nombre })) !== null) {
      throw new ConflictException(`La carrera ${nombre} ya existe`);
    }
  }

  private async validarNombreUniversidad(nombre: string) {
    if ((await this.universidadRepository.findOneBy({ nombre })) !== null) {
      throw new ConflictException(`La universidad ${nombre} ya existe`);
    }
  }

  private async validarSnies(snies: string) {
    if ((await this.ofertaRepository.findOneBy({ snies })) !== null) {
      throw new ConflictException(`La oferta con SNIES ${snies} ya existe`);
    }
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

  private escaparLike(texto: string) {
    return texto.replace(/[\\%_]/g, '\\$&');
  }

  private aDto(oferta: OfertaAcademica): OfertaAcademicaDto {
    return {
      id: oferta.id,
      universidadId: oferta.universidad.id,
      carreraId: oferta.carrera.id,
      universidad: oferta.universidad.nombre,
      carrera: oferta.carrera.nombre,
      imagenUrl: oferta.universidad.imagenUrl ?? null,
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
