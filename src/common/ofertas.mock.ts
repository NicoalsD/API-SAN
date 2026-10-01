export interface OfertaAcademica {
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

export const OFERTAS: OfertaAcademica[] = [
  {
    id: '1',
    universidad: 'Universidad Nacional de Colombia',
    carrera: 'Ingenieria de Sistemas',
    ciudad: 'Bogota',
    costo: 4500000,
    modalidad: 'presencial',
    jornada: 'diurna',
    duracion: 10,
    acreditacion: true,
    snies: '1001',
  },
  {
    id: '2',
    universidad: 'Universidad de los Andes',
    carrera: 'Ingenieria de Sistemas',
    ciudad: 'Bogota',
    costo: 22000000,
    modalidad: 'presencial',
    jornada: 'diurna',
    duracion: 9,
    acreditacion: true,
    snies: '1002',
  },
  {
    id: '3',
    universidad: 'Universidad Javeriana',
    carrera: 'Derecho',
    ciudad: 'Bogota',
    costo: 15000000,
    modalidad: 'presencial',
    jornada: 'nocturna',
    duracion: 10,
    acreditacion: true,
    snies: '1003',
  },
  {
    id: '4',
    universidad: 'Universidad de Antioquia',
    carrera: 'Medicina',
    ciudad: 'Medellin',
    costo: 6000000,
    modalidad: 'presencial',
    jornada: 'diurna',
    duracion: 12,
    acreditacion: true,
    snies: '1004',
  },
  {
    id: '5',
    universidad: 'Universidad EAFIT',
    carrera: 'Ingenieria de Sistemas',
    ciudad: 'Medellin',
    costo: 18000000,
    modalidad: 'virtual',
    jornada: 'mixta',
    duracion: 9,
    acreditacion: false,
    snies: '1005',
  },
];