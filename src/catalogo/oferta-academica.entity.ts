import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Carrera } from './carrera.entity';
import { Universidad } from './universidad.entity';

@Entity('ofertas_academicas')
export class OfertaAcademica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  snies: string;

  @Column()
  ciudad: string;

  @Column('int')
  costo: number;

  @Column()
  modalidad: string;

  @Column()
  jornada: string;

  @Column('int')
  duracion: number;

  @Column({ default: false })
  acreditacion: boolean;

  @ManyToOne(() => Universidad, (universidad) => universidad.ofertas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  universidad: Relation<Universidad>;

  @ManyToOne(() => Carrera, (carrera) => carrera.ofertas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  carrera: Relation<Carrera>;
}
