import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('perfiles')
export class Perfil {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ length: 100 })
  ciudad: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string | null;

  @CreateDateColumn()
  fechaRegistro: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}
