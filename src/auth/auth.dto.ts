import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
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

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
}
