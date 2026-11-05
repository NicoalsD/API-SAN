import { jest } from '@jest/globals';
import { ArgumentsHost } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { QueryFailedFilter } from './query-failed.filter';

describe('QueryFailedFilter', () => {
  let filtro: QueryFailedFilter;
  let status: jest.Mock;
  let json: jest.Mock;
  let host: ArgumentsHost;

  const errorConCodigo = (code?: string) =>
    Object.assign(new QueryFailedError('SELECT 1', [], new Error('fallo')), {
      code,
    });

  beforeEach(() => {
    filtro = new QueryFailedFilter();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    } as unknown as ArgumentsHost;
  });

  it('traduce 23505 a 409 con mensaje en espanol', () => {
    filtro.catch(errorConCodigo('23505'), host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'El registro ya existe' }),
    );
  });

  it('traduce 23503 a 409 con mensaje en espanol', () => {
    filtro.catch(errorConCodigo('23503'), host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'El registro esta relacionado con otros datos',
      }),
    );
  });

  it('responde 500 generico para otros codigos', () => {
    filtro.catch(errorConCodigo('42P01'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Internal Server Error' }),
    );
  });

  it('responde 500 generico si el error no trae codigo', () => {
    filtro.catch(errorConCodigo(), host);

    expect(status).toHaveBeenCalledWith(500);
  });
});
