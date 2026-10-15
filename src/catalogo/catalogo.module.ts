import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';
import { Carrera } from './carrera.entity';
import { OfertaAcademica } from './oferta-academica.entity';
import { Universidad } from './universidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Carrera, Universidad, OfertaAcademica])],
  controllers: [CatalogoController],
  providers: [CatalogoService],
  exports: [CatalogoService],
})
export class CatalogoModule {}
