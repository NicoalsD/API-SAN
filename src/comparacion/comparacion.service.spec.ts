import { jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Carrera } from '../catalogo/carrera.entity';
import { CatalogoService } from '../catalogo/catalogo.service';
import { OfertaAcademica } from '../catalogo/oferta-academica.entity';
import { Universidad } from '../catalogo/universidad.entity';
import { IDS_SEMILLA } from '../common/semilla';
import { Comparacion } from './comparacion.entity';
import { ComparacionService } from './comparacion.service';

const COMPARACION_ID = '00000000-0000-4000-8000-000000000901';

describe('ComparacionService', () => {
  let service: ComparacionService;
  let comparacionRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let catalogoService: {
    obtenerOfertas: jest.Mock;
  };

  const universidad = (id: string, nombre: string) =>
    ({ id, nombre, ciudad: 'Bogota' }) as Universidad;
  const carrera = {
    id: IDS_SEMILLA.carreras.sistemas,
    nombre: 'Ingenieria de Sistemas',
  } as Carrera;
  const oferta = (
    id: string,
    snies: string,
    universidadDatos: Universidad,
    costo: number,
    acreditacion: boolean,
  ) =>
    ({
      id,
      snies,
      ciudad: 'Bogota',
      costo,
      modalidad: 'presencial',
      jornada: 'diurna',
      duracion: 9,
      acreditacion,
      universidad: universidadDatos,
      carrera,
    }) as OfertaAcademica;

  const nacional = oferta(
    IDS_SEMILLA.ofertas.nacionalSistemas,
    '1001',
    universidad(IDS_SEMILLA.universidades.nacional, 'Universidad Nacional'),
    4500000,
    true,
  );
  const eafit = oferta(
    IDS_SEMILLA.ofertas.eafitSistemas,
    '1005',
    universidad(IDS_SEMILLA.universidades.eafit, 'Universidad EAFIT'),
    18000000,
    false,
  );

  beforeEach(async () => {
    comparacionRepository = {
      findOne: jest.fn(),
      create: jest.fn((datos: Partial<Comparacion>) => datos),
      save: jest.fn(async (datos: Partial<Comparacion>) => ({
        id: COMPARACION_ID,
        fecha: new Date(),
        ...datos,
      })),
      remove: jest.fn(async () => undefined),
    };
    catalogoService = {
      obtenerOfertas: jest.fn(async () => [nacional, eafit]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComparacionService,
        {
          provide: getRepositoryToken(Comparacion),
          useValue: comparacionRepository,
        },
        {
          provide: CatalogoService,
          useValue: catalogoService,
        },
      ],
    }).compile();

    service = module.get<ComparacionService>(ComparacionService);
  });

  it('compara ofertas y ordena la tabla por puntaje', async () => {
    const resultado = await service.crear({
      ofertaIds: [nacional.id, eafit.id],
    });

    expect(resultado.data.tabla).toHaveLength(2);
    expect(resultado.data.mejorOfertaId).toBe(nacional.id);
    expect(resultado.data.tabla[0].puntaje).toBeGreaterThanOrEqual(
      resultado.data.tabla[1].puntaje,
    );
  });

  it('rechaza ofertas repetidas', async () => {
    await expect(
      service.crear({ ofertaIds: [nacional.id, nacional.id] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza error si una oferta no existe', async () => {
    catalogoService.obtenerOfertas.mockRejectedValue(
      new NotFoundException('Oferta con ID 999 no existe'),
    );

    await expect(
      service.crear({ ofertaIds: [nacional.id, '999'] }),
    ).rejects.toThrow(NotFoundException);
  });

  it('elimina una comparacion existente', async () => {
    const { data } = await service.crear({
      ofertaIds: [nacional.id, eafit.id],
    });
    comparacionRepository.findOne
      .mockResolvedValueOnce({
        id: data.id,
        tabla: data.tabla,
        mejorOferta: nacional,
      } as Comparacion)
      .mockResolvedValueOnce(null);

    const respuesta = await service.eliminar(data.id);
    expect(respuesta.message).toContain('eliminada');
    await expect(service.obtener(data.id)).rejects.toThrow(NotFoundException);
  });
});
