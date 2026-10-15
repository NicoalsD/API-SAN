import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { OfertaAcademica } from '../catalogo/oferta-academica.entity';
import { FilaComparacionDto } from './comparacion.dto';

@Entity('comparaciones')
export class Comparacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => OfertaAcademica)
  @JoinTable({ name: 'comparacion_ofertas' })
  ofertas: Relation<OfertaAcademica[]>;

  @Column('jsonb')
  tabla: FilaComparacionDto[];

  @ManyToOne(() => OfertaAcademica, { nullable: true, onDelete: 'SET NULL' })
  mejorOferta: Relation<OfertaAcademica> | null;

  @CreateDateColumn()
  fecha: Date;
}
