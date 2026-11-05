import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

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

export class CrearPerfilDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ciudad: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  avatar?: string;
}
