import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { ComparacionController } from './comparacion.controller';
import { ComparacionService } from './comparacion.service';
import { Comparacion } from './comparacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comparacion]), CatalogoModule],
  controllers: [ComparacionController],
  providers: [ComparacionService],
  exports: [ComparacionService],
})
export class ComparacionModule {}
