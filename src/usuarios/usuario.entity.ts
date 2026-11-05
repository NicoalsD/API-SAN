import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { OfertaAcademica } from '../catalogo/oferta-academica.entity';
import { Perfil } from './perfil.entity';
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

  @OneToOne(() => Perfil, { nullable: true, cascade: true })
  @JoinColumn({ name: 'perfil_id' })
  perfil: Relation<Perfil> | null;

  @CreateDateColumn()
  fechaRegistro: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}
