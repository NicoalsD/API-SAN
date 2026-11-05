import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { IDS_SEMILLA } from '../common/semilla';
import { Carrera } from './carrera.entity';
import { CatalogoService } from './catalogo.service';
import { OfertaAcademica } from './oferta-academica.entity';
import { Universidad } from './universidad.entity';

describe('CatalogoService', () => {
  let service: CatalogoService;
  let carreraRepository: { find: jest.Mock };
  let universidadRepository: { find: jest.Mock; findOneBy: jest.Mock };
  let ofertaRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
  };

  const oferta = {
    id: IDS_SEMILLA.ofertas.nacionalSistemas,
    snies: '1001',
    ciudad: 'Bogota',
    costo: 4500000,
    modalidad: 'presencial',
    jornada: 'diurna',
    duracion: 10,
    acreditacion: true,
    universidad: { nombre: 'Universidad Nacional de Colombia' },
    carrera: { nombre: 'Ingenieria de Sistemas' },
  } as OfertaAcademica;

  beforeEach(() => {
    carreraRepository = { find: jest.fn() };
    universidadRepository = { find: jest.fn(), findOneBy: jest.fn() };
    ofertaRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };
    service = new CatalogoService(
      carreraRepository as unknown as Repository<Carrera>,
      universidadRepository as unknown as Repository<Universidad>,
      ofertaRepository as unknown as Repository<OfertaAcademica>,
    );
  });

  it('convierte las relaciones de la oferta a nombres', async () => {
    ofertaRepository.find.mockResolvedValue([oferta]);

    const resultado = await service.listarOfertas();

    expect(resultado).toEqual([
      {
        id: oferta.id,
        universidad: 'Universidad Nacional de Colombia',
        carrera: 'Ingenieria de Sistemas',
        ciudad: 'Bogota',
        costo: 4500000,
        modalidad: 'presencial',
        jornada: 'diurna',
        duracion: 10,
        acreditacion: true,
        snies: '1001',
      },
    ]);
  });

  it('lista todas las universidades sin filtro de ciudad', async () => {
    universidadRepository.find.mockResolvedValue([]);

    await service.listarUniversidades();

    expect(universidadRepository.find).toHaveBeenCalledWith({
      where: {},
      order: { nombre: 'ASC' },
    });
  });

  it('filtra universidades por ciudad sin distinguir mayusculas', async () => {
    universidadRepository.find.mockResolvedValue([]);

    await service.listarUniversidades('bogota');

    expect(universidadRepository.find).toHaveBeenCalledWith({
      where: { ciudad: ILike('bogota') },
      order: { nombre: 'ASC' },
    });
  });

  it('lista todas las carreras sin filtro de nombre', async () => {
    carreraRepository.find.mockResolvedValue([]);

    await service.listarCarreras();

    expect(carreraRepository.find).toHaveBeenCalledWith({
      where: {},
      order: { nombre: 'ASC' },
    });
  });

  it('filtra carreras por coincidencia parcial del nombre', async () => {
    carreraRepository.find.mockResolvedValue([]);

    await service.listarCarreras('sist');

    expect(carreraRepository.find).toHaveBeenCalledWith({
      where: { nombre: ILike('%sist%') },
      order: { nombre: 'ASC' },
    });
  });

  it('escapa los comodines del filtro', async () => {
    carreraRepository.find.mockResolvedValue([]);

    await service.listarCarreras('100%_');

    expect(carreraRepository.find).toHaveBeenCalledWith({
      where: { nombre: ILike('%100\\%\\_%') },
      order: { nombre: 'ASC' },
    });
  });

  it('lanza error si la oferta no existe', async () => {
    ofertaRepository.findOne.mockResolvedValue(null);

    await expect(service.obtenerOferta('999')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('devuelve la universidad con sus ofertas', async () => {
    const universidadId = '00000000-0000-4000-8000-000000000021';
    universidadRepository.findOneBy.mockResolvedValue({
      id: universidadId,
      nombre: 'Universidad Nacional de Colombia',
      ciudad: 'Bogota',
      ofertas: [],
    });
    ofertaRepository.find.mockResolvedValue([oferta]);

    const resultado = await service.obtenerUniversidad(universidadId);

    expect(ofertaRepository.find).toHaveBeenCalledWith({
      where: { universidad: { id: universidadId } },
      relations: { universidad: true, carrera: true },
      order: { snies: 'ASC' },
    });
    expect(resultado.id).toBe(universidadId);
    expect(resultado.nombre).toBe('Universidad Nacional de Colombia');
    expect(resultado.ciudad).toBe('Bogota');
    expect(resultado.ofertas).toHaveLength(1);
    expect(resultado.ofertas[0]).toMatchObject({
      id: oferta.id,
      universidad: 'Universidad Nacional de Colombia',
      carrera: 'Ingenieria de Sistemas',
      snies: '1001',
    });
  });

  it('devuelve ofertas vacias si la universidad no tiene', async () => {
    universidadRepository.findOneBy.mockResolvedValue({
      id: 'u1',
      nombre: 'Universidad X',
      ciudad: 'Cali',
    });
    ofertaRepository.find.mockResolvedValue([]);

    const resultado = await service.obtenerUniversidad('u1');

    expect(resultado.ofertas).toEqual([]);
  });

  it('lanza error si la universidad no existe', async () => {
    universidadRepository.findOneBy.mockResolvedValue(null);

    await expect(service.obtenerUniversidad('999')).rejects.toThrow(
      NotFoundException,
    );
    expect(ofertaRepository.find).not.toHaveBeenCalled();
  });
});
