import { Module } from '@nestjs/common';
import { BusquedaController } from './busqueda.controller';
import { BusquedaService } from './busqueda.service';
import { ScoringService } from './scoring.service';

@Module({
  controllers: [BusquedaController],
  providers: [BusquedaService, ScoringService],
  exports: [BusquedaService],
})
export class BusquedaModule {}
