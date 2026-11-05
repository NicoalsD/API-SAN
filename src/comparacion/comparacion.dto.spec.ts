import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { IDS_SEMILLA } from '../common/semilla';
import { ComparacionRequestDto } from './comparacion.dto';

const ids = [
  IDS_SEMILLA.ofertas.nacionalSistemas,
  IDS_SEMILLA.ofertas.andesSistemas,
  IDS_SEMILLA.ofertas.javerianaDerecho,
  IDS_SEMILLA.ofertas.antioquiaMedicina,
  IDS_SEMILLA.ofertas.eafitSistemas,
];

const errores = (ofertaIds: unknown) =>
  validate(plainToInstance(ComparacionRequestDto, { ofertaIds }));

describe('ComparacionRequestDto', () => {
  it('acepta entre 2 y 4 ofertas distintas', async () => {
    expect(await errores(ids.slice(0, 2))).toHaveLength(0);
    expect(await errores(ids.slice(0, 4))).toHaveLength(0);
  });

  it('rechaza menos de 2 ofertas', async () => {
    expect(await errores(ids.slice(0, 1))).not.toHaveLength(0);
  });

  it('rechaza mas de 4 ofertas', async () => {
    const resultado = await errores(ids.slice(0, 5));

    expect(resultado[0].constraints).toHaveProperty('arrayMaxSize');
  });

  it('rechaza ofertas repetidas', async () => {
    const resultado = await errores([ids[0], ids[0]]);

    expect(resultado[0].constraints).toHaveProperty('arrayUnique');
  });
});
