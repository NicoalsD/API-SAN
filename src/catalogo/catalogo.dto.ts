export class CarreraDto {
  id: string;
  nombre: string;
}

export class UniversidadDto {
  id: string;
  nombre: string;
  ciudad: string;
}

export class OfertaAcademicaDto {
  id: string;
  universidad: string;
  carrera: string;
  ciudad: string;
  costo: number;
  modalidad: string;
  jornada: string;
  duracion: number;
  acreditacion: boolean;
  snies: string;
}
