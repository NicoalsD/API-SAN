import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class ComparacionRequestDto {
  @IsArray()
  @ArrayMinSize(2)
  @IsUUID('4', { each: true })
  ofertaIds: string[];
}

export class FilaComparacionDto {
  ofertaId: string;
  universidad: string;
  costoTotal: number;
  duracion: number;
  modalidad: string;
  acreditacion: boolean;
  puntaje: number;
}

export class ComparacionDto {
  id: string;
  tabla: FilaComparacionDto[];
  mejorOfertaId: string;
}
