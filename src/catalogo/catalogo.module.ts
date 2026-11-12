import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';
import { Carrera } from './carrera.entity';
import { OfertaAcademica } from './oferta-academica.entity';
import { Universidad } from './universidad.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carrera, Universidad, OfertaAcademica]),
    AuthModule,
  ],
  controllers: [CatalogoController],
  providers: [CatalogoService],
  exports: [CatalogoService],
})
export class CatalogoModule {}
