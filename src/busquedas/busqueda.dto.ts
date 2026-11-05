import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { OfertaAcademicaDto } from '../catalogo/catalogo.dto';
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

  @IsOptional()
  @IsUUID()
  usuarioId?: string;
}

export class DesgloseDto {
  costo: number;
  modalidad: number;
  ubicacion: number;
  acreditacion: number;
}

export class ResultadoBusquedaDto {
  oferta: OfertaAcademicaDto;
  puntaje: number;
  desglose: DesgloseDto;
}
