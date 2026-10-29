import { DataSource, Repository } from 'typeorm';
import { Carrera } from '../catalogo/carrera.entity';
import { OfertaAcademica } from '../catalogo/oferta-academica.entity';
import { Universidad } from '../catalogo/universidad.entity';
import { Usuario } from '../usuarios/usuario.entity';

const uuid = (numero: number) =>
  `00000000-0000-4000-8000-${`${numero}`.padStart(12, '0')}`;

export const IDS_SEMILLA = {
  usuario: uuid(1),
  carreras: {
    sistemas: uuid(11),
    derecho: uuid(12),
    medicina: uuid(13),
  },
  universidades: {
    nacional: uuid(21),
    andes: uuid(22),
    javeriana: uuid(23),
    antioquia: uuid(24),
    eafit: uuid(25),
  },
  ofertas: {
    nacionalSistemas: uuid(101),
    andesSistemas: uuid(102),
    javerianaDerecho: uuid(103),
    antioquiaMedicina: uuid(104),
    eafitSistemas: uuid(105),
  },
} as const;

const CARRERAS = [
  { id: IDS_SEMILLA.carreras.sistemas, nombre: 'Ingenieria de Sistemas' },
  { id: IDS_SEMILLA.carreras.derecho, nombre: 'Derecho' },
  { id: IDS_SEMILLA.carreras.medicina, nombre: 'Medicina' },
];

const UNIVERSIDADES = [
  {
    id: IDS_SEMILLA.universidades.nacional,
    nombre: 'Universidad Nacional de Colombia',
    ciudad: 'Bogota',
  },
  {
    id: IDS_SEMILLA.universidades.andes,
    nombre: 'Universidad de los Andes',
    ciudad: 'Bogota',
  },
  {
    id: IDS_SEMILLA.universidades.javeriana,
    nombre: 'Universidad Javeriana',
    ciudad: 'Bogota',
  },
  {
    id: IDS_SEMILLA.universidades.antioquia,
    nombre: 'Universidad de Antioquia',
    ciudad: 'Medellin',
  },
  {
    id: IDS_SEMILLA.universidades.eafit,
    nombre: 'Universidad EAFIT',
    ciudad: 'Medellin',
  },
];

const OFERTAS = [
  {
    id: IDS_SEMILLA.ofertas.nacionalSistemas,
    universidadId: IDS_SEMILLA.universidades.nacional,
    carreraId: IDS_SEMILLA.carreras.sistemas,
    snies: '1001',
    ciudad: 'Bogota',
    costo: 4500000,
    modalidad: 'presencial',
    jornada: 'diurna',
    duracion: 10,
    acreditacion: true,
  },
  {
    id: IDS_SEMILLA.ofertas.andesSistemas,
    universidadId: IDS_SEMILLA.universidades.andes,
    carreraId: IDS_SEMILLA.carreras.sistemas,
    snies: '1002',
    ciudad: 'Bogota',
    costo: 22000000,
    modalidad: 'presencial',
    jornada: 'diurna',
    duracion: 9,
    acreditacion: true,
  },
  {
    id: IDS_SEMILLA.ofertas.javerianaDerecho,
    universidadId: IDS_SEMILLA.universidades.javeriana,
    carreraId: IDS_SEMILLA.carreras.derecho,
    snies: '1003',
    ciudad: 'Bogota',
    costo: 15000000,
    modalidad: 'presencial',
    jornada: 'nocturna',
    duracion: 10,
    acreditacion: true,
  },
  {
    id: IDS_SEMILLA.ofertas.antioquiaMedicina,
    universidadId: IDS_SEMILLA.universidades.antioquia,
    carreraId: IDS_SEMILLA.carreras.medicina,
    snies: '1004',
    ciudad: 'Medellin',
    costo: 6000000,
    modalidad: 'presencial',
    jornada: 'diurna',
    duracion: 12,
    acreditacion: true,
  },
  {
    id: IDS_SEMILLA.ofertas.eafitSistemas,
    universidadId: IDS_SEMILLA.universidades.eafit,
    carreraId: IDS_SEMILLA.carreras.sistemas,
    snies: '1005',
    ciudad: 'Medellin',
    costo: 18000000,
    modalidad: 'virtual',
    jornada: 'mixta',
    duracion: 9,
    acreditacion: false,
  },
];

async function asegurarCarrera(
  repositorio: Repository<Carrera>,
  id: string,
  nombre: string,
) {
  const existente = await repositorio.findOneBy({ nombre });
  if (existente !== null) {
    return existente;
  }

  return repositorio.save(repositorio.create({ id, nombre }));
}

async function asegurarUniversidad(
  repositorio: Repository<Universidad>,
  id: string,
  nombre: string,
  ciudad: string,
) {
  const existente = await repositorio.findOneBy({ nombre });
  if (existente !== null) {
    return existente;
  }

  return repositorio.save(repositorio.create({ id, nombre, ciudad }));
}

export async function sembrarBd(dataSource: DataSource) {
  const carreras = new Map<string, Carrera>();
  for (const carrera of CARRERAS) {
    carreras.set(
      carrera.id,
      await asegurarCarrera(
        dataSource.getRepository(Carrera),
        carrera.id,
        carrera.nombre,
      ),
    );
  }

  const universidades = new Map<string, Universidad>();
  for (const universidad of UNIVERSIDADES) {
    universidades.set(
      universidad.id,
      await asegurarUniversidad(
        dataSource.getRepository(Universidad),
        universidad.id,
        universidad.nombre,
        universidad.ciudad,
      ),
    );
  }

  const ofertas = dataSource.getRepository(OfertaAcademica);
  for (const oferta of OFERTAS) {
    const existente = await ofertas.findOneBy({ snies: oferta.snies });
    if (existente !== null) {
      continue;
    }

    const universidad = universidades.get(oferta.universidadId);
    const carrera = carreras.get(oferta.carreraId);
    if (universidad === undefined || carrera === undefined) {
      throw new Error(`Faltan relaciones para la oferta ${oferta.snies}`);
    }

    await ofertas.save(
      ofertas.create({
        id: oferta.id,
        snies: oferta.snies,
        ciudad: oferta.ciudad,
        costo: oferta.costo,
        modalidad: oferta.modalidad,
        jornada: oferta.jornada,
        duracion: oferta.duracion,
        acreditacion: oferta.acreditacion,
        universidad,
        carrera,
      }),
    );
  }

  const usuarios = dataSource.getRepository(Usuario);
  const existente = await usuarios.findOneBy({ correo: 'nicolas@correo.com' });
  if (existente === null) {
    await usuarios.save(
      usuarios.create({
        id: IDS_SEMILLA.usuario,
        nombre: 'Nicolas',
        correo: 'nicolas@correo.com',
        clave: '123456',
        preferencias: { costo: 3, modalidad: 3, ubicacion: 3, acreditacion: 3 },
      }),
    );
  }
}
