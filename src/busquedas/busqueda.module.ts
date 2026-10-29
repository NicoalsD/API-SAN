import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { BusquedaController } from './busqueda.controller';
import { BusquedaService } from './busqueda.service';
import { ScoringService } from './scoring.service';
import { Busqueda } from './busqueda.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Busqueda]), CatalogoModule],
  controllers: [BusquedaController],
  providers: [BusquedaService, ScoringService],
  exports: [BusquedaService],
})
export class BusquedaModule {}
