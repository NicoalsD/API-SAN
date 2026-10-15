import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusquedaController } from './busqueda.controller';
import { BusquedaService } from './busqueda.service';
import { ScoringService } from './scoring.service';
import { Busqueda } from './busqueda.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Busqueda])],
  controllers: [BusquedaController],
  providers: [BusquedaService, ScoringService],
  exports: [BusquedaService],
})
export class BusquedaModule {}
