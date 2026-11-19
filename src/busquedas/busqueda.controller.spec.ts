import { jest } from '@jest/globals';
import { BusquedaController } from './busqueda.controller';
import { BusquedaService } from './busqueda.service';

describe('BusquedaController', () => {
  let controller: BusquedaController;
  let servicio: {
    crear: jest.Mock;
    obtener: jest.Mock;
    obtenerResultados: jest.Mock;
  };

  const respuesta = { message: 'ok', data: {} };
  const id = '00000000-0000-4000-8000-000000000098';

  beforeEach(() => {
    servicio = {
      crear: jest.fn(async () => respuesta),
      obtener: jest.fn(async () => respuesta),
      obtenerResultados: jest.fn(async () => ({ message: 'ok', data: [] })),
    };
    controller = new BusquedaController(servicio as unknown as BusquedaService);
  });

  it('POST /busquedas delega en crear con el body', async () => {
    const datos = { carrera: 'Ingenieria de Sistemas', ciudad: 'Bogota' };

    await expect(controller.crear(datos)).resolves.toEqual(respuesta);
    expect(servicio.crear).toHaveBeenCalledWith(datos);
  });

  it('GET /busquedas/:id delega en obtener', async () => {
    await expect(controller.obtener(id)).resolves.toEqual(respuesta);
    expect(servicio.obtener).toHaveBeenCalledWith(id);
  });

  it('GET /busquedas/:id/resultados delega en obtenerResultados', async () => {
    await expect(controller.obtenerResultados(id)).resolves.toEqual({
      message: 'ok',
      data: [],
    });
    expect(servicio.obtenerResultados).toHaveBeenCalledWith(id);
  });
});
