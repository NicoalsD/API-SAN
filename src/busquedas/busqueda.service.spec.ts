import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IDS_SEMILLA } from '../common/semilla';
import { CatalogoService } from '../catalogo/catalogo.service';
import { OfertaAcademicaDto } from '../catalogo/catalogo.dto';
import { Usuario } from '../usuarios/usuario.entity';
import { Busqueda } from './busqueda.entity';
import { BusquedaService } from './busqueda.service';
import { ScoringService } from './scoring.service';

const OFERTAS: OfertaAcademicaDto[] = [
  {
    id: IDS_SEMILLA.ofertas.nacionalSistemas,
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
  {
    id: IDS_SEMILLA.ofertas.andesSistemas,
    universidad: 'Universidad de los Andes',
    carrera: 'Ingenieria de Sistemas',
    ciudad: 'Bogota',
    costo: 22000000,
    modalidad: 'presencial',
    jornada: 'diurna',
    duracion: 9,
    acreditacion: true,
    snies: '1002',
  },
  {
    id: IDS_SEMILLA.ofertas.javerianaDerecho,
    universidad: 'Universidad Javeriana',
    carrera: 'Derecho',
    ciudad: 'Bogota',
    costo: 15000000,
    modalidad: 'presencial',
    jornada: 'nocturna',
    duracion: 10,
    acreditacion: true,
    snies: '1003',
  },
  {
    id: IDS_SEMILLA.ofertas.antioquiaMedicina,
    universidad: 'Universidad de Antioquia',
    carrera: 'Medicina',
    ciudad: 'Medellin',
    costo: 6000000,
    modalidad: 'presencial',
    jornada: 'diurna',
    duracion: 12,
    acreditacion: true,
    snies: '1004',
  },
  {
    id: IDS_SEMILLA.ofertas.eafitSistemas,
    universidad: 'Universidad EAFIT',
    carrera: 'Ingenieria de Sistemas',
    ciudad: 'Medellin',
    costo: 18000000,
    modalidad: 'virtual',
    jornada: 'mixta',
    duracion: 9,
    acreditacion: false,
    snies: '1005',
  },
];

describe('BusquedaService', () => {
  let service: BusquedaService;
  let busquedaRepository: {
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let scoringService: ScoringService;
  let usuarioRepository: { findOneBy: jest.Mock };
  let catalogoService: {
    listarOfertas: jest.Mock;
  };

  beforeEach(async () => {
    busquedaRepository = {
      findOneBy: jest.fn(),
      create: jest.fn((datos: Partial<Busqueda>) => datos),
      save: jest.fn(async (datos: Busqueda) => ({
        id: 'busqueda-1',
        fecha: new Date('2026-01-01T00:00:00.000Z'),
        ...datos,
      })),
    };
    usuarioRepository = { findOneBy: jest.fn() };
    catalogoService = {
      listarOfertas: jest.fn(async () => OFERTAS),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusquedaService,
        ScoringService,
        {
          provide: getRepositoryToken(Busqueda),
          useValue: busquedaRepository,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarioRepository,
        },
        {
          provide: CatalogoService,
          useValue: catalogoService,
        },
      ],
    }).compile();

    service = module.get<BusquedaService>(BusquedaService);
    scoringService = module.get<ScoringService>(ScoringService);
  });

  it('filtra por carrera y ordena por puntaje', async () => {
    const resultado = await service.crear({
      carrera: 'Ingenieria de Sistemas',
      costoMax: 25000000,
    });

    const resultados = resultado.data.resultados;
    expect(resultados).toHaveLength(3);
    expect(resultados[0].puntaje).toBeGreaterThanOrEqual(
      resultados[resultados.length - 1].puntaje,
    );
  });

  it('desempata por menor costo y luego por nombre de universidad', async () => {
    const base = OFERTAS[0];
    const ofertas: OfertaAcademicaDto[] = [
      { ...base, id: 'a', universidad: 'Zeta', costo: 5000000 },
      { ...base, id: 'b', universidad: 'Beta', costo: 9000000 },
      { ...base, id: 'c', universidad: 'Alfa', costo: 5000000 },
      { ...base, id: 'd', universidad: 'Mayor', costo: 1000000 },
    ];
    catalogoService.listarOfertas.mockResolvedValue(ofertas);
    jest.spyOn(scoringService, 'calcular').mockImplementation((oferta) => ({
      puntaje: oferta.id === 'd' ? 50 : 80,
      desglose: { costo: 0, modalidad: 0, ubicacion: 0, acreditacion: 0 },
    }));

    const resultado = await service.crear({ carrera: base.carrera });

    expect(resultado.data.resultados.map((r) => r.oferta.universidad)).toEqual([
      'Alfa',
      'Zeta',
      'Beta',
      'Mayor',
    ]);
  });

  it('asocia la busqueda al usuario sin guardar usuarioId en filtros', async () => {
    const usuario = { id: IDS_SEMILLA.usuario } as Usuario;
    usuarioRepository.findOneBy.mockResolvedValue(usuario);

    await service.crear({
      carrera: 'Derecho',
      usuarioId: usuario.id,
    });

    expect(usuarioRepository.findOneBy).toHaveBeenCalledWith({
      id: usuario.id,
    });
    expect(busquedaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        usuario,
        filtros: { carrera: 'Derecho' },
      }),
    );
  });

  it('guarda la busqueda sin usuario si no viene usuarioId', async () => {
    await service.crear({ carrera: 'Derecho' });

    expect(usuarioRepository.findOneBy).not.toHaveBeenCalled();
    expect(busquedaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ usuario: null }),
    );
  });

  it('lanza error si el usuario no existe', async () => {
    usuarioRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.crear({
        carrera: 'Derecho',
        usuarioId: '11111111-1111-4111-8111-111111111111',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(busquedaRepository.save).not.toHaveBeenCalled();
  });

  it('lanza error si la busqueda no existe', async () => {
    busquedaRepository.findOneBy.mockResolvedValue(null);

    await expect(service.obtener('999')).rejects.toThrow(NotFoundException);
  });
});
