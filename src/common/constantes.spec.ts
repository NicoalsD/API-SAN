import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BusquedaRequestDto } from '../busquedas/busqueda.dto';
import { JORNADAS, MODALIDADES } from './constantes';

describe('constantes de dominio', () => {
  it('define las modalidades', () => {
    expect([...MODALIDADES]).toEqual(['presencial', 'virtual', 'hibrida']);
  });

  it('define las jornadas', () => {
    expect([...JORNADAS]).toEqual(['diurna', 'nocturna', 'mixta']);
  });

  it('BusquedaRequestDto acepta valores validos', async () => {
    const dto = plainToInstance(BusquedaRequestDto, {
      carrera: 'Derecho',
      modalidad: 'hibrida',
      jornada: 'mixta',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('BusquedaRequestDto rechaza una modalidad invalida', async () => {
    const dto = plainToInstance(BusquedaRequestDto, {
      carrera: 'Derecho',
      modalidad: 'remota',
    });

    const errores = await validate(dto);
    expect(errores.map((e) => e.property)).toEqual(['modalidad']);
  });

  it('BusquedaRequestDto rechaza una jornada invalida', async () => {
    const dto = plainToInstance(BusquedaRequestDto, {
      carrera: 'Derecho',
      jornada: 'madrugada',
    });

    const errores = await validate(dto);
    expect(errores.map((e) => e.property)).toEqual(['jornada']);
  });
});
