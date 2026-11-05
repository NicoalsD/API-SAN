import { OfertaAcademicaDto } from '../catalogo/catalogo.dto';
import { BusquedaRequestDto } from './busqueda.dto';
import { ScoringService } from './scoring.service';

function crearOferta(
  overrides: Partial<OfertaAcademicaDto> = {},
): OfertaAcademicaDto {
  return {
    id: 'oferta-1',
    universidad: 'Universidad Nacional de Colombia',
    carrera: 'Ingenieria de Sistemas',
    ciudad: 'Bogota',
    costo: 1000,
    modalidad: 'presencial',
    jornada: 'diurna',
    duracion: 10,
    acreditacion: true,
    snies: '1001',
    ...overrides,
  };
}

describe('ScoringService (casos base)', () => {
  let service: ScoringService;

  beforeEach(() => {
    service = new ScoringService();
  });

  it('usa pesos por defecto (1 en cada criterio) cuando no se envian pesos', () => {
    // costoMax 4000 y costo 1000 -> costo 0.75; modalidad, ubicacion y
    // acreditacion sin coincidencia -> 0. Con pesos iguales:
    // 0.75 / 4 * 100 = 18.75 -> 19.
    const filtros: BusquedaRequestDto = {
      carrera: 'Ingenieria de Sistemas',
      costoMax: 4000,
      modalidad: 'virtual',
      ciudad: 'Medellin',
    };
    const oferta = crearOferta({ acreditacion: false });

    const resultado = service.calcular(oferta, filtros);

    expect(resultado.puntaje).toBe(19);
    expect(resultado.desglose).toEqual({
      costo: 0.75,
      modalidad: 0,
      ubicacion: 0,
      acreditacion: 0,
    });
  });

  it('da puntaje 100 cuando todo coincide, sin costoMax y con oferta acreditada', () => {
    const filtros: BusquedaRequestDto = {
      carrera: 'Ingenieria de Sistemas',
      ciudad: 'Bogota',
      modalidad: 'presencial',
    };

    const resultado = service.calcular(crearOferta(), filtros);

    expect(resultado.puntaje).toBe(100);
    expect(resultado.desglose).toEqual({
      costo: 1,
      modalidad: 1,
      ubicacion: 1,
      acreditacion: 1,
    });
  });

  it('siempre incluye el desglose con las 4 claves', () => {
    const resultado = service.calcular(crearOferta(), {
      carrera: 'Ingenieria de Sistemas',
    });

    expect(resultado.desglose).toEqual(
      expect.objectContaining({
        costo: expect.any(Number),
        modalidad: expect.any(Number),
        ubicacion: expect.any(Number),
        acreditacion: expect.any(Number),
      }),
    );
    expect(Object.keys(resultado.desglose).sort()).toEqual([
      'acreditacion',
      'costo',
      'modalidad',
      'ubicacion',
    ]);
  });

  it('deja modalidad y ubicacion en 0 cuando no coinciden', () => {
    const filtros: BusquedaRequestDto = {
      carrera: 'Ingenieria de Sistemas',
      ciudad: 'Medellin',
      modalidad: 'virtual',
    };

    const resultado = service.calcular(crearOferta(), filtros);

    expect(resultado.desglose.modalidad).toBe(0);
    expect(resultado.desglose.ubicacion).toBe(0);
  });

  it('da ubicacion 1 aunque la ciudad llegue con otras mayusculas', () => {
    const filtros: BusquedaRequestDto = {
      carrera: 'Ingenieria de Sistemas',
      ciudad: 'BOGOTA',
    };

    const resultado = service.calcular(crearOferta(), filtros);

    expect(resultado.desglose.ubicacion).toBe(1);
  });
});
