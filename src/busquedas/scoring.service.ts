import { Injectable } from '@nestjs/common';
import { OfertaAcademica } from '../common/ofertas.mock';
import { PreferenciaDto } from '../usuarios/usuario.dto';
import { BusquedaRequestDto, DesgloseDto } from './busqueda.dto';

const PESOS_POR_DEFECTO: PreferenciaDto = {
  costo: 1,
  modalidad: 1,
  ubicacion: 1,
  acreditacion: 1,
};

@Injectable()
export class ScoringService {
  calcular(
    oferta: OfertaAcademica,
    filtros: BusquedaRequestDto,
  ): { puntaje: number; desglose: DesgloseDto } {
    const pesos = filtros.pesos ?? PESOS_POR_DEFECTO;

    const desglose: DesgloseDto = {
      costo: this.puntajeCosto(oferta, filtros.costoMax),
      modalidad:
        !filtros.modalidad || oferta.modalidad === filtros.modalidad ? 1 : 0,
      ubicacion: !filtros.ciudad || oferta.ciudad === filtros.ciudad ? 1 : 0,
      acreditacion: oferta.acreditacion ? 1 : 0,
    };

    const pesoTotal =
      pesos.costo + pesos.modalidad + pesos.ubicacion + pesos.acreditacion;
    const suma =
      desglose.costo * pesos.costo +
      desglose.modalidad * pesos.modalidad +
      desglose.ubicacion * pesos.ubicacion +
      desglose.acreditacion * pesos.acreditacion;

    return {
      puntaje: pesoTotal === 0 ? 0 : Math.round((suma / pesoTotal) * 100),
      desglose,
    };
  }

  private puntajeCosto(oferta: OfertaAcademica, costoMax?: number) {
    if (costoMax === undefined) {
      return 1;
    }

    return Math.max(0, 1 - oferta.costo / costoMax);
  }
}