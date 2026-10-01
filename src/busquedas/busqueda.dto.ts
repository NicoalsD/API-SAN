import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { OfertaAcademica } from '../common/ofertas.mock';
import { PreferenciaDto } from '../usuarios/usuario.dto';

export class BusquedaRequestDto {
  @IsString()
  @IsNotEmpty()
  carrera: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  costoMax?: number;

  @IsOptional()
  @IsIn(['presencial', 'virtual', 'hibrida'])
  modalidad?: string;

  @IsOptional()
  @IsIn(['diurna', 'nocturna', 'mixta'])
  jornada?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferenciaDto)
  pesos?: PreferenciaDto;
}

export class DesgloseDto {
  costo: number;
  modalidad: number;
  ubicacion: number;
  acreditacion: number;
}

export class ResultadoBusquedaDto {
  oferta: OfertaAcademica;
  puntaje: number;
  desglose: DesgloseDto;
}