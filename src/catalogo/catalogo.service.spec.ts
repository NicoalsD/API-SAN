import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IDS_SEMILLA } from '../common/semilla';
import { Carrera } from './carrera.entity';
import { CatalogoService } from './catalogo.service';
import { OfertaAcademica } from './oferta-academica.entity';
import { Universidad } from './universidad.entity';

describe('CatalogoService', () => {
  let service: CatalogoService;
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
    ofertaRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };
    service = new CatalogoService(
      { find: jest.fn() } as unknown as Repository<Carrera>,
      { find: jest.fn() } as unknown as Repository<Universidad>,
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

  it('lanza error si la oferta no existe', async () => {
    ofertaRepository.findOne.mockResolvedValue(null);

    await expect(service.obtenerOferta('999')).rejects.toThrow(
      NotFoundException,
    );
  });
});
