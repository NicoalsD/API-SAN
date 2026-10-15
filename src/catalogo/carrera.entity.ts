import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { OfertaAcademica } from './oferta-academica.entity';

@Entity('carreras')
export class Carrera {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @OneToMany(() => OfertaAcademica, (oferta) => oferta.carrera)
  ofertas: Relation<OfertaAcademica[]>;
}
