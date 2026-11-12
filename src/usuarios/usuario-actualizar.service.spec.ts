import { jest } from '@jest/globals';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OfertaAcademica } from '../catalogo/oferta-academica.entity';
import { IDS_SEMILLA } from '../common/semilla';
import { Perfil } from './perfil.entity';
import { UsuarioService } from './usuario.service';
import { Usuario } from './usuario.entity';

describe('UsuarioService (obtener y actualizar)', () => {
  let service: UsuarioService;
  let usuarioRepository: {
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    merge: jest.Mock;
    save: jest.Mock;
  };
  let usuario: Usuario;

  beforeEach(async () => {
    usuario = {
      id: IDS_SEMILLA.usuario,
      nombre: 'Nicolas',
      correo: 'nicolas@correo.com',
      clave: '12345678',
      preferencias: { costo: 3, modalidad: 3, ubicacion: 3, acreditacion: 3 },
      favoritos: [],
      perfil: { id: 'perfil-1', apellido: 'Diaz', ciudad: 'Bogota' } as Perfil,
      fechaRegistro: new Date(),
      fechaActualizacion: new Date(),
    };
    usuarioRepository = {
      findOne: jest.fn(async () => usuario),
      findOneBy: jest.fn(async () => null),
      merge: jest.fn((destino: object, ...fuentes: object[]) =>
        Object.assign(destino, ...fuentes),
      ),
      save: jest.fn(async (guardado: Usuario) => guardado),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepository },
        { provide: getRepositoryToken(OfertaAcademica), useValue: {} },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
  });

  it('obtiene el usuario con su perfil y sin la clave', async () => {
    const resultado = await service.obtener(usuario.id);

    expect(usuarioRepository.findOne).toHaveBeenCalledWith({
      where: { id: usuario.id },
      relations: { perfil: true },
    });
    expect(resultado.data.perfil?.apellido).toBe('Diaz');
    expect(resultado.data).not.toHaveProperty('clave');
  });

  it('lanza NotFoundException si el usuario no existe', async () => {
    usuarioRepository.findOne.mockResolvedValue(null);

    await expect(service.obtener('no-existe')).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.actualizar('no-existe', {})).rejects.toThrow(
      NotFoundException,
    );
  });

  it('actualiza datos del usuario y del perfil con merge', async () => {
    const resultado = await service.actualizar(usuario.id, {
      nombre: 'Nico',
      perfil: { ciudad: 'Medellin' },
    });

    expect(usuarioRepository.merge).toHaveBeenCalledWith(usuario, {
      nombre: 'Nico',
      perfil: { ciudad: 'Medellin' },
    });
    expect(usuarioRepository.save).toHaveBeenCalled();
    expect(resultado.message).toBe('Usuario actualizado correctamente');
    expect(resultado.data).not.toHaveProperty('clave');
  });

  it('rechaza un correo que ya usa otro usuario', async () => {
    usuarioRepository.findOneBy.mockResolvedValue({ id: 'otro' });

    await expect(
      service.actualizar(usuario.id, { correo: 'ocupado@correo.com' }),
    ).rejects.toThrow(ConflictException);
    expect(usuarioRepository.save).not.toHaveBeenCalled();
  });

  it('no busca duplicados si el correo no cambia', async () => {
    await service.actualizar(usuario.id, { correo: usuario.correo });

    expect(usuarioRepository.findOneBy).not.toHaveBeenCalled();
  });

  it('exige apellido y ciudad para crear un perfil que no existia', async () => {
    usuario.perfil = null;

    await expect(
      service.actualizar(usuario.id, { perfil: { ciudad: 'Cali' } }),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.actualizar(usuario.id, {
        perfil: { apellido: 'Diaz', ciudad: 'Cali' },
      }),
    ).resolves.toEqual(
      expect.objectContaining({ message: 'Usuario actualizado correctamente' }),
    );
  });

  it('hashea la clave nueva al actualizar', async () => {
    const resultado = await service.actualizar(usuario.id, {
      clave: 'nueva-clave-123',
    });

    expect(usuario.clave).not.toBe('nueva-clave-123');
    expect(usuario.clave.startsWith('$2')).toBe(true);
    expect(resultado.data).not.toHaveProperty('clave');
  });
});
