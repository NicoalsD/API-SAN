import { Injectable, NotFoundException } from '@nestjs/common';
import { FavoritoDto, PreferenciaDto } from './usuario.dto';

interface Usuario {
  id: string;
  nombre: string;
  preferencias: PreferenciaDto;
  favoritos: string[];
}

@Injectable()
export class UsuarioService {
  private usuarios: Usuario[] = [
    {
      id: '1',
      nombre: 'Nicolas',
      preferencias: { costo: 3, modalidad: 3, ubicacion: 3, acreditacion: 3 },
      favoritos: [],
    },
  ];

  obtenerPreferencias(id: string) {
    return this.buscarUsuario(id).preferencias;
  }

  actualizarPreferencias(id: string, preferencias: PreferenciaDto) {
    const usuario = this.buscarUsuario(id);
    usuario.preferencias = preferencias;

    return {
      message: 'Preferencias actualizadas',
      data: usuario.preferencias,
    };
  }

  listarFavoritos(id: string) {
    return this.buscarUsuario(id).favoritos;
  }

  agregarFavorito(id: string, datos: FavoritoDto) {
    const usuario = this.buscarUsuario(id);
    if (!usuario.favoritos.includes(datos.ofertaId)) {
      usuario.favoritos.push(datos.ofertaId);
    }

    return {
      message: 'Favorito agregado',
      data: usuario.favoritos,
    };
  }

  eliminarFavorito(id: string, ofertaId: string) {
    const usuario = this.buscarUsuario(id);
    usuario.favoritos = usuario.favoritos.filter(
      (favorito) => favorito !== ofertaId,
    );

    return {
      message: 'Favorito eliminado',
      data: usuario.favoritos,
    };
  }

  private buscarUsuario(id: string) {
    const usuario = this.usuarios.find((usuario) => usuario.id === id);
    if (usuario === undefined) {
      throw new NotFoundException(`Usuario con ID ${id} no existe`);
    }

    return usuario;
  }
}