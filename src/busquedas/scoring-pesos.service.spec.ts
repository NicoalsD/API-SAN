import { OfertaAcademicaDto } from '../catalogo/catalogo.dto';
import { PreferenciaDto } from '../usuarios/usuario.dto';
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

function pesos(valores: Partial<PreferenciaDto>): PreferenciaDto {
  return {
    costo: 0,
    modalidad: 0,
    ubicacion: 0,
    acreditacion: 0,
    ...valores,
  };
}

describe('ScoringService (pesos y costo)', () => {
  let service: ScoringService;

  beforeEach(() => {
    service = new ScoringService();
  });

  it('da puntaje 0 cuando todos los pesos son 0', () => {
    const filtros: BusquedaRequestDto = {
      carrera: 'Ingenieria de Sistemas',
      ciudad: 'Bogota',
      modalidad: 'presencial',
      costoMax: 4000,
      pesos: pesos({}),
    };

    const resultado = service.calcular(crearOferta(), filtros);

    expect(resultado.puntaje).toBe(0);
  });

  it('calcula puntajeCosto como 1 - costo / costoMax', () => {
    // costo 1000, costoMax 4000 -> 1 - 0.25 = 0.75
    // costo 3000, costoMax 4000 -> 1 - 0.75 = 0.25
    const filtros: BusquedaRequestDto = {
      carrera: 'Ingenieria de Sistemas',
      costoMax: 4000,
    };

    const barata = service.calcular(crearOferta({ costo: 1000 }), filtros);
    const cara = service.calcular(crearOferta({ costo: 3000 }), filtros);

    expect(barata.desglose.costo).toBeCloseTo(0.75, 10);
    expect(cara.desglose.costo).toBeCloseTo(0.25, 10);
  });

  it('no deja puntajeCosto negativo cuando el costo supera costoMax', () => {
    // costo 5000, costoMax 4000 -> 1 - 1.25 = -0.25 -> 0
    const filtros: BusquedaRequestDto = {
      carrera: 'Ingenieria de Sistemas',
      costoMax: 4000,
    };

    const resultado = service.calcular(crearOferta({ costo: 5000 }), filtros);

    expect(resultado.desglose.costo).toBe(0);
    expect(resultado.desglose.costo).toBeGreaterThanOrEqual(0);
  });

  it('el puntaje de costo es 75 cuando solo pesa costo y costo/costoMax = 0.25', () => {
    const filtros: BusquedaRequestDto = {
      carrera: 'Ingenieria de Sistemas',
      costoMax: 4000,
      pesos: pesos({ costo: 1 }),
    };

    const resultado = service.calcular(crearOferta({ costo: 1000 }), filtros);

    expect(resultado.puntaje).toBe(75);
  });

  it('un peso dominante cambia el puntaje como se espera', () => {
    // Desglose: costo 0.25 (costo 3000, costoMax 4000), modalidad 1,
    // ubicacion 0, acreditacion 1.
    const base: BusquedaRequestDto = {
      carrera: 'Ingenieria de Sistemas',
      costoMax: 4000,
      modalidad: 'presencial',
      ciudad: 'Medellin',
    };
    const oferta = crearOferta({ costo: 3000 });

    // Pesos iguales: (0.25 + 1 + 0 + 1) / 4 = 0.5625 -> 56
    const conPesosIguales = service.calcular(oferta, {
      ...base,
      pesos: pesos({ costo: 1, modalidad: 1, ubicacion: 1, acreditacion: 1 }),
    });

    // Costo dominante (5): (0.25*5 + 1 + 0 + 1) / 8 = 0.40625 -> 41
    const conCostoDominante = service.calcular(oferta, {
      ...base,
      pesos: pesos({ costo: 5, modalidad: 1, ubicacion: 1, acreditacion: 1 }),
    });

    expect(conPesosIguales.puntaje).toBe(56);
    expect(conCostoDominante.puntaje).toBe(41);
    expect(conCostoDominante.puntaje).toBeLessThan(conPesosIguales.puntaje);
  });

  it('solo acreditacion pesa: la oferta sin acreditar da 0 y la acreditada da 100', () => {
    const filtros: BusquedaRequestDto = {
      carrera: 'Ingenieria de Sistemas',
      pesos: pesos({ acreditacion: 3 }),
    };

    const acreditada = service.calcular(
      crearOferta({ acreditacion: true }),
      filtros,
    );
    const sinAcreditar = service.calcular(
      crearOferta({ acreditacion: false }),
      filtros,
    );

    expect(acreditada.puntaje).toBe(100);
    expect(sinAcreditar.puntaje).toBe(0);
  });

  it('redondea el puntaje a entero (sube 68.75 a 69)', () => {
    // costo 1000/4000 -> 0.75; modalidad 1; ubicacion 0; acreditacion 1.
    // Pesos iguales: (0.75 + 1 + 0 + 1) / 4 = 0.6875 -> 68.75 -> 69
    const filtros: BusquedaRequestDto = {
      carrera: 'Ingenieria de Sistemas',
      costoMax: 4000,
      modalidad: 'presencial',
      ciudad: 'Medellin',
    };

    const resultado = service.calcular(crearOferta({ costo: 1000 }), filtros);

    expect(resultado.puntaje).toBe(69);
    expect(Number.isInteger(resultado.puntaje)).toBe(true);
  });

  it('redondea el puntaje a entero (baja 56.25 a 56)', () => {
    // costo 3000/4000 -> 0.25; modalidad 1; ubicacion 0; acreditacion 1.
    // Pesos iguales: (0.25 + 1 + 0 + 1) / 4 = 0.5625 -> 56.25 -> 56
    const filtros: BusquedaRequestDto = {
      carrera: 'Ingenieria de Sistemas',
      costoMax: 4000,
      modalidad: 'presencial',
      ciudad: 'Medellin',
    };

    const resultado = service.calcular(crearOferta({ costo: 3000 }), filtros);

    expect(resultado.puntaje).toBe(56);
    expect(Number.isInteger(resultado.puntaje)).toBe(true);
  });
});
