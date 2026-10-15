import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { OfertaAcademica } from './oferta-academica.entity';

@Entity('universidades')
export class Universidad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column()
  ciudad: string;

  @OneToMany(() => OfertaAcademica, (oferta) => oferta.universidad)
  ofertas: Relation<OfertaAcademica[]>;
}
