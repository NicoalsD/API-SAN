import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Rol } from '../common/constantes';
import { CrearPerfilDto } from '../usuarios/perfil.dto';

export class RegistroDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  correo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  clave: string;

  @ValidateNested()
  @Type(() => CrearPerfilDto)
  @IsNotEmpty()
  perfil: CrearPerfilDto;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  clave: string;
}

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class UsuarioAutenticadoDto {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioAutenticadoDto;
}

export interface PayloadAccesoJwt {
  sub: string;
  correo: string;
  rol: Rol;
}

export interface PayloadRefreshJwt {
  sub: string;
}
