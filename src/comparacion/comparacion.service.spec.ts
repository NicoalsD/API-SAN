import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CatalogoService } from '../catalogo/catalogo.service';
import { ComparacionService } from './comparacion.service';

describe('ComparacionService', () => {
  let service: ComparacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComparacionService, CatalogoService],
    }).compile();

    service = module.get<ComparacionService>(ComparacionService);
  });

  it('compara ofertas y ordena la tabla por puntaje', () => {
    const resultado = service.crear({ ofertaIds: ['1', '5'] });

    expect(resultado.data.tabla).toHaveLength(2);
    expect(resultado.data.mejorOfertaId).toBe('1');
    expect(resultado.data.tabla[0].puntaje).toBeGreaterThanOrEqual(
      resultado.data.tabla[1].puntaje,
    );
  });

  it('rechaza ofertas repetidas', () => {
    expect(() => service.crear({ ofertaIds: ['1', '1'] })).toThrow(
      BadRequestException,
    );
  });

  it('lanza error si una oferta no existe', () => {
    expect(() => service.crear({ ofertaIds: ['1', '999'] })).toThrow(
      NotFoundException,
    );
  });

  it('elimina una comparacion existente', () => {
    const { data } = service.crear({ ofertaIds: ['1', '2'] });

    const respuesta = service.eliminar(data.id);
    expect(respuesta.message).toContain('eliminada');
    expect(() => service.obtener(data.id)).toThrow(NotFoundException);
  });
});