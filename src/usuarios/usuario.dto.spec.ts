import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ActualizarUsuarioDto } from './usuario.dto';

const propiedadesInvalidas = async (datos: object) =>
  (await validate(plainToInstance(ActualizarUsuarioDto, datos))).map(
    (error) => error.property,
  );

describe('ActualizarUsuarioDto', () => {
  it('acepta un cuerpo vacio porque todos los campos son opcionales', async () => {
    expect(await propiedadesInvalidas({})).toEqual([]);
  });

  it('hereda las reglas de RegistroDto', async () => {
    expect(await propiedadesInvalidas({ clave: '1234567' })).toEqual(['clave']);
    expect(await propiedadesInvalidas({ correo: 'no-es-correo' })).toEqual([
      'correo',
    ]);
  });

  it('acepta un perfil parcial', async () => {
    expect(await propiedadesInvalidas({ perfil: { ciudad: 'Cali' } })).toEqual(
      [],
    );
  });

  it('valida los campos del perfil parcial', async () => {
    expect(
      await propiedadesInvalidas({ perfil: { avatar: 'no-es-url' } }),
    ).toEqual(['perfil']);
    expect(await propiedadesInvalidas({ perfil: { apellido: '' } })).toEqual([
      'perfil',
    ]);
  });
});
