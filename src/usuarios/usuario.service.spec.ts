import { jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OfertaAcademica } from '../catalogo/oferta-academica.entity';
import { IDS_SEMILLA } from '../common/semilla';
import { UsuarioService } from './usuario.service';
import { Usuario } from './usuario.entity';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let usuarioRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let ofertaRepository: {
    findOneBy: jest.Mock;
  };
  let usuario: Usuario;

  const oferta = {
    id: IDS_SEMILLA.ofertas.nacionalSistemas,
    snies: '1001',
  } as OfertaAcademica;

  beforeEach(async () => {
    usuario = {
      id: IDS_SEMILLA.usuario,
      nombre: 'Nicolas',
      correo: 'nicolas@correo.com',
      clave: '123456',
      preferencias: { costo: 3, modalidad: 3, ubicacion: 3, acreditacion: 3 },
      favoritos: [],
      fechaRegistro: new Date(),
    };
    usuarioRepository = {
      findOne: jest.fn(async () => usuario),
      save: jest.fn(async (guardado: Usuario) => guardado),
    };
    ofertaRepository = {
      findOneBy: jest.fn(async () => oferta),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarioRepository,
        },
        {
          provide: getRepositoryToken(OfertaAcademica),
          useValue: ofertaRepository,
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
  });

  it('agrega un favorito y rechaza duplicados', async () => {
    const resultado = await service.agregarFavorito(usuario.id, {
      ofertaId: oferta.id,
    });
    expect(resultado.data).toEqual([oferta.id]);
    expect(await service.listarFavoritos(usuario.id)).toEqual([oferta.id]);

    await expect(
      service.agregarFavorito(usuario.id, { ofertaId: oferta.id }),
    ).rejects.toThrow(ConflictException);
  });

  it('lanza error si la oferta no existe', async () => {
    ofertaRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.agregarFavorito(usuario.id, { ofertaId: '999' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza error al eliminar un favorito que no existe', async () => {
    await expect(service.eliminarFavorito(usuario.id, '999')).rejects.toThrow(
      NotFoundException,
    );
  });
});
