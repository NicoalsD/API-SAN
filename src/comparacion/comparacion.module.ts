import { Module } from '@nestjs/common';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { ComparacionController } from './comparacion.controller';
import { ComparacionService } from './comparacion.service';

@Module({
  imports: [CatalogoModule],
  controllers: [ComparacionController],
  providers: [ComparacionService],
  exports: [ComparacionService],
})
export class ComparacionModule {}
