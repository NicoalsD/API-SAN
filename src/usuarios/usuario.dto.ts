import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { RegistroDto } from '../auth/auth.dto';
import { ActualizarPerfilDto } from './perfil.dto';

export class PreferenciaDto {
  @IsInt()
  @Min(0)
  @Max(5)
  costo: number;

  @IsInt()
  @Min(0)
  @Max(5)
  modalidad: number;

  @IsInt()
  @Min(0)
  @Max(5)
  ubicacion: number;

  @IsInt()
  @Min(0)
  @Max(5)
  acreditacion: number;
}

export class FavoritoDto {
  @IsUUID()
  @IsNotEmpty()
  ofertaId: string;
}

export class ActualizarUsuarioDto extends PartialType(
  OmitType(RegistroDto, ['perfil'] as const),
) {
  @IsOptional()
  @ValidateNested()
  @Type(() => ActualizarPerfilDto)
  perfil?: ActualizarPerfilDto;
}
