import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfertaAcademica } from '../catalogo/oferta-academica.entity';
import { FavoritoDto, PreferenciaDto } from './usuario.dto';
import { Usuario } from './usuario.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(OfertaAcademica)
    private readonly ofertaRepository: Repository<OfertaAcademica>,
  ) {}

  async obtenerPreferencias(id: string) {
    return (await this.buscarUsuario(id)).preferencias;
  }

  async actualizarPreferencias(id: string, preferencias: PreferenciaDto) {
    const usuario = await this.buscarUsuario(id);
    usuario.preferencias = preferencias;
    await this.usuarioRepository.save(usuario);

    return {
      message: 'Preferencias actualizadas',
      data: usuario.preferencias,
    };
  }

  async listarFavoritos(id: string) {
    return this.idsFavoritos(await this.buscarUsuario(id));
  }

  async agregarFavorito(id: string, datos: FavoritoDto) {
    const usuario = await this.buscarUsuario(id);
    if (usuario.favoritos.some((oferta) => oferta.id === datos.ofertaId)) {
      throw new ConflictException(
        `La oferta ${datos.ofertaId} ya esta en favoritos`,
      );
    }

    const oferta = await this.ofertaRepository.findOneBy({
      id: datos.ofertaId,
    });
    if (oferta === null) {
      throw new NotFoundException(`Oferta con ID ${datos.ofertaId} no existe`);
    }

    usuario.favoritos.push(oferta);
    await this.usuarioRepository.save(usuario);

    return {
      message: 'Favorito agregado',
      data: this.idsFavoritos(usuario),
    };
  }

  async eliminarFavorito(id: string, ofertaId: string) {
    const usuario = await this.buscarUsuario(id);
    if (!usuario.favoritos.some((oferta) => oferta.id === ofertaId)) {
      throw new NotFoundException(`La oferta ${ofertaId} no esta en favoritos`);
    }

    usuario.favoritos = usuario.favoritos.filter(
      (oferta) => oferta.id !== ofertaId,
    );
    await this.usuarioRepository.save(usuario);

    return {
      message: 'Favorito eliminado',
      data: this.idsFavoritos(usuario),
    };
  }

  private async buscarUsuario(id: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: { favoritos: true },
    });
    if (usuario === null) {
      throw new NotFoundException(`Usuario con ID ${id} no existe`);
    }

    return usuario;
  }

  private idsFavoritos(usuario: Usuario) {
    return usuario.favoritos.map((oferta) => oferta.id);
  }
}
