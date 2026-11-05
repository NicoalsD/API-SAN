import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto, RegistroDto } from './auth.dto';

const valido = {
  nombre: 'Ana',
  correo: 'ana@correo.com',
  clave: '12345678',
};

const propiedadesInvalidas = async (datos: object) =>
  (await validate(plainToInstance(RegistroDto, datos))).map(
    (error) => error.property,
  );

describe('RegistroDto', () => {
  it('acepta datos validos', async () => {
    expect(await propiedadesInvalidas(valido)).toEqual([]);
  });

  it('rechaza claves de menos de 8 caracteres', async () => {
    expect(await propiedadesInvalidas({ ...valido, clave: '1234567' })).toEqual(
      ['clave'],
    );
  });

  it('rechaza nombres de mas de 100 caracteres', async () => {
    expect(
      await propiedadesInvalidas({ ...valido, nombre: 'a'.repeat(101) }),
    ).toEqual(['nombre']);
    expect(
      await propiedadesInvalidas({ ...valido, nombre: 'a'.repeat(100) }),
    ).toEqual([]);
  });

  it('rechaza correos de mas de 150 caracteres', async () => {
    const largo = `${'a'.repeat(141)}@correo.com`;

    expect(await propiedadesInvalidas({ ...valido, correo: largo })).toEqual([
      'correo',
    ]);
  });
});

describe('LoginDto', () => {
  it('no exige largo minimo de clave', async () => {
    const errores = await validate(
      plainToInstance(LoginDto, { correo: 'ana@correo.com', clave: '123' }),
    );

    expect(errores).toHaveLength(0);
  });
});
