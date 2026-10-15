import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { BusquedaRequestDto, ResultadoBusquedaDto } from './busqueda.dto';

@Entity('busquedas')
export class Busqueda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb')
  filtros: BusquedaRequestDto;

  @Column('jsonb')
  resultados: ResultadoBusquedaDto[];

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  usuario: Relation<Usuario> | null;

  @CreateDateColumn()
  fecha: Date;
}
