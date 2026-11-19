import { jest } from '@jest/globals';
import { IDS_SEMILLA } from '../common/semilla';
import { ComparacionController } from './comparacion.controller';
import { ComparacionService } from './comparacion.service';

describe('ComparacionController', () => {
  let controller: ComparacionController;
  let servicio: {
    crear: jest.Mock;
    obtener: jest.Mock;
    eliminar: jest.Mock;
  };

  const respuesta = { message: 'ok', data: {} };
  const id = '00000000-0000-4000-8000-000000000099';

  beforeEach(() => {
    servicio = {
      crear: jest.fn(async () => respuesta),
      obtener: jest.fn(async () => respuesta),
      eliminar: jest.fn(async () => ({ msg: 'ok' })),
    };
    controller = new ComparacionController(
      servicio as unknown as ComparacionService,
    );
  });

  it('POST /comparaciones delega en crear con el body', async () => {
    const datos = {
      ofertaIds: [
        IDS_SEMILLA.ofertas.nacionalSistemas,
        IDS_SEMILLA.ofertas.andesSistemas,
      ],
    };

    await expect(controller.crear(datos)).resolves.toEqual(respuesta);
    expect(servicio.crear).toHaveBeenCalledWith(datos);
  });

  it('GET /comparaciones/:id delega en obtener', async () => {
    await expect(controller.obtener(id)).resolves.toEqual(respuesta);
    expect(servicio.obtener).toHaveBeenCalledWith(id);
  });

  it('DELETE /comparaciones/:id delega en eliminar', async () => {
    await expect(controller.eliminar(id)).resolves.toEqual({ msg: 'ok' });
    expect(servicio.eliminar).toHaveBeenCalledWith(id);
  });
});
