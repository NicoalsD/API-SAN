import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

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
  @IsString()
  @IsNotEmpty()
  ofertaId: string;
}