import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuarioService],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
  });

  it('agrega un favorito y rechaza duplicados', () => {
    service.agregarFavorito('1', { ofertaId: '1' });
    expect(service.listarFavoritos('1')).toEqual(['1']);

    expect(() => service.agregarFavorito('1', { ofertaId: '1' })).toThrow(
      ConflictException,
    );
  });

  it('lanza error al eliminar un favorito que no existe', () => {
    expect(() => service.eliminarFavorito('1', '999')).toThrow(
      NotFoundException,
    );
  });
});