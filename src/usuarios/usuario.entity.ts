import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { OfertaAcademica } from '../catalogo/oferta-academica.entity';
import { PreferenciaDto } from './usuario.dto';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ unique: true })
  correo: string;

  @Column()
  clave: string;

  @Column('jsonb', {
    default: { costo: 3, modalidad: 3, ubicacion: 3, acreditacion: 3 },
  })
  preferencias: PreferenciaDto;

  @ManyToMany(() => OfertaAcademica)
  @JoinTable({ name: 'usuario_favoritos' })
  favoritos: Relation<OfertaAcademica[]>;

  @CreateDateColumn()
  fechaRegistro: Date;
}
