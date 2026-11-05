import { jest } from '@jest/globals';
import {
  CallHandler,
  ExecutionContext,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logSpy: jest.SpiedFunction<Logger['log']>;

  const contexto = (statusCode = 200) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/carreras' }),
        getResponse: () => ({ statusCode }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    logSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('registra metodo, url, status y duracion al terminar', async () => {
    const handler: CallHandler = { handle: () => of({ ok: true }) };

    const resultado = await lastValueFrom(
      interceptor.intercept(contexto(201), handler),
    );

    expect(resultado).toEqual({ ok: true });
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toMatch(/^GET \/carreras 201 - \d+ms$/);
  });

  it('registra el status del error y lo vuelve a lanzar', async () => {
    const handler: CallHandler = {
      handle: () => throwError(() => new NotFoundException('no existe')),
    };

    await expect(
      lastValueFrom(interceptor.intercept(contexto(), handler)),
    ).rejects.toThrow(NotFoundException);
    expect(logSpy.mock.calls[0][0]).toMatch(/^GET \/carreras 404 - \d+ms$/);
  });

  it('usa 500 cuando el error no es una excepcion HTTP', async () => {
    const handler: CallHandler = {
      handle: () => throwError(() => new Error('fallo')),
    };

    await expect(
      lastValueFrom(interceptor.intercept(contexto(), handler)),
    ).rejects.toThrow('fallo');
    expect(logSpy.mock.calls[0][0]).toMatch(/^GET \/carreras 500 - \d+ms$/);
  });
});
