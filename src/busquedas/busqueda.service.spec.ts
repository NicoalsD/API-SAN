import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BusquedaService } from './busqueda.service';
import { ScoringService } from './scoring.service';

describe('BusquedaService', () => {
  let service: BusquedaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusquedaService, ScoringService],
    }).compile();

    service = module.get<BusquedaService>(BusquedaService);
  });

  it('filtra por carrera y ordena por puntaje', () => {
    const resultado = service.crear({
      carrera: 'Ingenieria de Sistemas',
      costoMax: 25000000,
    });

    const resultados = resultado.data.resultados;
    expect(resultados.length).toBeGreaterThan(0);
    expect(resultados[0].puntaje).toBeGreaterThanOrEqual(
      resultados[resultados.length - 1].puntaje,
    );
  });

  it('lanza error si la busqueda no existe', () => {
    expect(() => service.obtener('999')).toThrow(NotFoundException);
  });
});