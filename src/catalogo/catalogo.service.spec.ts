import { jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { IDS_SEMILLA } from '../common/semilla';
import { Carrera } from './carrera.entity';
import { CatalogoService } from './catalogo.service';
import { OfertaAcademica } from './oferta-academica.entity';
import { Universidad } from './universidad.entity';

describe('CatalogoService', () => {
  let service: CatalogoService;
  let carreraRepository: {
    find: jest.Mock;
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    merge: jest.Mock;
    remove: jest.Mock;
  };
  let universidadRepository: {
    find: jest.Mock;
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    merge: jest.Mock;
    remove: jest.Mock;
  };
  let ofertaRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    merge: jest.Mock;
    remove: jest.Mock;
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
    universidad: {
      id: IDS_SEMILLA.universidades.nacional,
      nombre: 'Universidad Nacional de Colombia',
      imagenUrl: '/campus/nacional.webp',
    },
    carrera: {
      id: IDS_SEMILLA.carreras.sistemas,
      nombre: 'Ingenieria de Sistemas',
    },
  } as OfertaAcademica;

  const datosOferta = {
    snies: '2001',
    ciudad: 'Bogota',
    costo: 1000000,
    modalidad: 'presencial',
    jornada: 'diurna',
    duracion: 8,
    acreditacion: false,
    universidadId: IDS_SEMILLA.universidades.nacional,
    carreraId: IDS_SEMILLA.carreras.sistemas,
  };

  beforeEach(() => {
    const repositorioBase = () => ({
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn((datos: object) => datos),
      save: jest.fn((entidad: object) => Promise.resolve(entidad)),
      merge: jest.fn((entidad: object, datos: object) =>
        Object.assign(entidad, datos),
      ),
      remove: jest.fn(),
    });
    carreraRepository = repositorioBase();
    universidadRepository = repositorioBase();
    ofertaRepository = { ...repositorioBase(), findOne: jest.fn() };
    service = new CatalogoService(
      carreraRepository as unknown as Repository<Carrera>,
      universidadRepository as unknown as Repository<Universidad>,
      ofertaRepository as unknown as Repository<OfertaAcademica>,
    );
  });

  it('convierte las relaciones de la oferta a nombres', async () => {
    ofertaRepository.find.mockResolvedValue([oferta]);

    const resultado = await service.listarOfertas();

    expect(resultado).toEqual([
      {
        id: oferta.id,
        universidadId: IDS_SEMILLA.universidades.nacional,
        carreraId: IDS_SEMILLA.carreras.sistemas,
        universidad: 'Universidad Nacional de Colombia',
        carrera: 'Ingenieria de Sistemas',
        imagenUrl: '/campus/nacional.webp',
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

  it('lista todas las universidades sin filtro de ciudad', async () => {
    universidadRepository.find.mockResolvedValue([]);

    await service.listarUniversidades();

    expect(universidadRepository.find).toHaveBeenCalledWith({
      where: {},
      order: { nombre: 'ASC' },
    });
  });

  it('filtra universidades por ciudad sin distinguir mayusculas', async () => {
    universidadRepository.find.mockResolvedValue([]);

    await service.listarUniversidades('bogota');

    expect(universidadRepository.find).toHaveBeenCalledWith({
      where: { ciudad: ILike('bogota') },
      order: { nombre: 'ASC' },
    });
  });

  it('lista todas las carreras sin filtro de nombre', async () => {
    carreraRepository.find.mockResolvedValue([]);

    await service.listarCarreras();

    expect(carreraRepository.find).toHaveBeenCalledWith({
      where: {},
      order: { nombre: 'ASC' },
    });
  });

  it('filtra carreras por coincidencia parcial del nombre', async () => {
    carreraRepository.find.mockResolvedValue([]);

    await service.listarCarreras('sist');

    expect(carreraRepository.find).toHaveBeenCalledWith({
      where: { nombre: ILike('%sist%') },
      order: { nombre: 'ASC' },
    });
  });

  it('escapa los comodines del filtro', async () => {
    carreraRepository.find.mockResolvedValue([]);

    await service.listarCarreras('100%_');

    expect(carreraRepository.find).toHaveBeenCalledWith({
      where: { nombre: ILike('%100\\%\\_%') },
      order: { nombre: 'ASC' },
    });
  });

  it('lanza error si la oferta no existe', async () => {
    ofertaRepository.findOne.mockResolvedValue(null);

    await expect(service.obtenerOferta('999')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('devuelve la universidad con sus ofertas', async () => {
    const universidadId = '00000000-0000-4000-8000-000000000021';
    universidadRepository.findOneBy.mockResolvedValue({
      id: universidadId,
      nombre: 'Universidad Nacional de Colombia',
      ciudad: 'Bogota',
      ofertas: [],
    });
    ofertaRepository.find.mockResolvedValue([oferta]);

    const resultado = await service.obtenerUniversidad(universidadId);

    expect(ofertaRepository.find).toHaveBeenCalledWith({
      where: { universidad: { id: universidadId } },
      relations: { universidad: true, carrera: true },
      order: { snies: 'ASC' },
    });
    expect(resultado.id).toBe(universidadId);
    expect(resultado.nombre).toBe('Universidad Nacional de Colombia');
    expect(resultado.ciudad).toBe('Bogota');
    expect(resultado.ofertas).toHaveLength(1);
    expect(resultado.ofertas[0]).toMatchObject({
      id: oferta.id,
      universidad: 'Universidad Nacional de Colombia',
      carrera: 'Ingenieria de Sistemas',
      snies: '1001',
    });
  });

  it('devuelve ofertas vacias si la universidad no tiene', async () => {
    universidadRepository.findOneBy.mockResolvedValue({
      id: 'u1',
      nombre: 'Universidad X',
      ciudad: 'Cali',
    });
    ofertaRepository.find.mockResolvedValue([]);

    const resultado = await service.obtenerUniversidad('u1');

    expect(resultado.ofertas).toEqual([]);
  });

  it('lanza error si la universidad no existe', async () => {
    universidadRepository.findOneBy.mockResolvedValue(null);

    await expect(service.obtenerUniversidad('999')).rejects.toThrow(
      NotFoundException,
    );
    expect(ofertaRepository.find).not.toHaveBeenCalled();
  });

  it('filtra ofertas por carrera, universidad y ciudad', async () => {
    ofertaRepository.find.mockResolvedValue([]);

    await service.listarOfertas({
      carreraId: 'c1',
      universidadId: 'u1',
      ciudad: 'bogota',
    });

    expect(ofertaRepository.find).toHaveBeenCalledWith({
      where: {
        carrera: { id: 'c1' },
        universidad: { id: 'u1' },
        ciudad: ILike('bogota'),
      },
      relations: { universidad: true, carrera: true },
      order: { snies: 'ASC' },
    });
  });

  describe('carreras', () => {
    it('crea una carrera', async () => {
      carreraRepository.findOneBy.mockResolvedValue(null);

      const resultado = await service.crearCarrera({ nombre: 'Fisica' });

      expect(resultado.data).toEqual({ nombre: 'Fisica' });
      expect(carreraRepository.save).toHaveBeenCalled();
    });

    it('rechaza una carrera duplicada', async () => {
      carreraRepository.findOneBy.mockResolvedValue({ id: 'c1' });

      await expect(service.crearCarrera({ nombre: 'Fisica' })).rejects.toThrow(
        ConflictException,
      );
      expect(carreraRepository.save).not.toHaveBeenCalled();
    });

    it('actualiza una carrera existente', async () => {
      carreraRepository.findOneBy
        .mockResolvedValueOnce({ id: 'c1', nombre: 'Fisica' })
        .mockResolvedValueOnce(null);

      const resultado = await service.actualizarCarrera('c1', {
        nombre: 'Matematicas',
      });

      expect(resultado.data.nombre).toBe('Matematicas');
    });

    it('rechaza actualizar una carrera a un nombre repetido', async () => {
      carreraRepository.findOneBy
        .mockResolvedValueOnce({ id: 'c1', nombre: 'Fisica' })
        .mockResolvedValueOnce({ id: 'c2' });

      await expect(
        service.actualizarCarrera('c1', { nombre: 'Matematicas' }),
      ).rejects.toThrow(ConflictException);
    });

    it('lanza 404 al actualizar o eliminar una carrera inexistente', async () => {
      carreraRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.actualizarCarrera('x', { nombre: 'A' }),
      ).rejects.toThrow(NotFoundException);
      await expect(service.eliminarCarrera('x')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('elimina una carrera', async () => {
      const carrera = { id: 'c1', nombre: 'Fisica' };
      carreraRepository.findOneBy.mockResolvedValue(carrera);

      await service.eliminarCarrera('c1');

      expect(carreraRepository.remove).toHaveBeenCalledWith(carrera);
    });
  });

  describe('universidades', () => {
    it('crea una universidad con imagen', async () => {
      universidadRepository.findOneBy.mockResolvedValue(null);

      const resultado = await service.crearUniversidad({
        nombre: 'Universidad X',
        ciudad: 'Cali',
        imagenUrl: '/campus/x.webp',
      });

      expect(resultado.data.imagenUrl).toBe('/campus/x.webp');
    });

    it('rechaza una universidad duplicada', async () => {
      universidadRepository.findOneBy.mockResolvedValue({ id: 'u1' });

      await expect(
        service.crearUniversidad({ nombre: 'Universidad X', ciudad: 'Cali' }),
      ).rejects.toThrow(ConflictException);
    });

    it('actualiza una universidad sin validar el mismo nombre', async () => {
      universidadRepository.findOneBy.mockResolvedValue({
        id: 'u1',
        nombre: 'Universidad X',
        ciudad: 'Cali',
      });

      const resultado = await service.actualizarUniversidad('u1', {
        nombre: 'Universidad X',
        ciudad: 'Bogota',
      });

      expect(resultado.data.ciudad).toBe('Bogota');
      expect(universidadRepository.findOneBy).toHaveBeenCalledTimes(1);
    });

    it('lanza 404 al eliminar una universidad inexistente', async () => {
      universidadRepository.findOneBy.mockResolvedValue(null);

      await expect(service.eliminarUniversidad('x')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('elimina una universidad', async () => {
      const universidad = { id: 'u1' };
      universidadRepository.findOneBy.mockResolvedValue(universidad);

      await service.eliminarUniversidad('u1');

      expect(universidadRepository.remove).toHaveBeenCalledWith(universidad);
    });
  });

  describe('ofertas', () => {
    it('crea una oferta asignando universidad y carrera por id', async () => {
      ofertaRepository.findOneBy.mockResolvedValue(null);
      carreraRepository.findOneBy.mockResolvedValue({ id: 'c1' });
      universidadRepository.findOneBy.mockResolvedValue({ id: 'u1' });
      ofertaRepository.save.mockResolvedValue({ id: oferta.id });
      ofertaRepository.findOne.mockResolvedValue(oferta);

      const resultado = await service.crearOferta(datosOferta);

      expect(ofertaRepository.create).toHaveBeenCalledWith({
        snies: '2001',
        ciudad: 'Bogota',
        costo: 1000000,
        modalidad: 'presencial',
        jornada: 'diurna',
        duracion: 8,
        acreditacion: false,
        universidad: { id: datosOferta.universidadId },
        carrera: { id: datosOferta.carreraId },
      });
      expect(resultado.data.id).toBe(oferta.id);
    });

    it('rechaza un SNIES duplicado', async () => {
      ofertaRepository.findOneBy.mockResolvedValue({ id: 'o1' });

      await expect(service.crearOferta(datosOferta)).rejects.toThrow(
        ConflictException,
      );
    });

    it('lanza 404 si la carrera o la universidad no existen', async () => {
      ofertaRepository.findOneBy.mockResolvedValue(null);
      carreraRepository.findOneBy.mockResolvedValue(null);
      universidadRepository.findOneBy.mockResolvedValue({ id: 'u1' });

      await expect(service.crearOferta(datosOferta)).rejects.toThrow(
        'Carrera con ID',
      );

      carreraRepository.findOneBy.mockResolvedValue({ id: 'c1' });
      universidadRepository.findOneBy.mockResolvedValue(null);

      await expect(service.crearOferta(datosOferta)).rejects.toThrow(
        NotFoundException,
      );
      expect(ofertaRepository.save).not.toHaveBeenCalled();
    });

    it('actualiza una oferta y cambia la universidad', async () => {
      ofertaRepository.findOne.mockResolvedValue({ ...oferta });
      universidadRepository.findOneBy.mockResolvedValue({ id: 'u2' });

      await service.actualizarOferta(oferta.id, {
        costo: 5,
        universidadId: 'u2',
      });

      expect(ofertaRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ costo: 5, universidad: { id: 'u2' } }),
      );
    });

    it('rechaza actualizar una oferta a un SNIES repetido', async () => {
      ofertaRepository.findOne.mockResolvedValue({ ...oferta });
      ofertaRepository.findOneBy.mockResolvedValue({ id: 'otra' });

      await expect(
        service.actualizarOferta(oferta.id, { snies: '9999' }),
      ).rejects.toThrow(ConflictException);
    });

    it('lanza 404 al actualizar o eliminar una oferta inexistente', async () => {
      ofertaRepository.findOne.mockResolvedValue(null);

      await expect(service.actualizarOferta('x', { costo: 1 })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.eliminarOferta('x')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('elimina una oferta', async () => {
      ofertaRepository.findOne.mockResolvedValue(oferta);

      await service.eliminarOferta(oferta.id);

      expect(ofertaRepository.remove).toHaveBeenCalledWith(oferta);
    });
  });
});
